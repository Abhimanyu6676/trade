export const convertCandleTimeline = ({
  _1mCandles,
  newCandlePeriod,
}: {
  _1mCandles: OPENALGO.history.historyCandles[];
  newCandlePeriod: number;
}): OPENALGO.history.historyCandles[] | undefined => {
  if (_1mCandles.length < newCandlePeriod) return undefined;

  const newCandles: OPENALGO.history.historyCandles[] = [];
  for (let i = 0; i < _1mCandles.length; i += newCandlePeriod) {
    const chunk = _1mCandles.slice(i, i + newCandlePeriod);

    // Create an entirely new object with new data
    const combined: OPENALGO.history.historyCandles = {
      timestamp: chunk[0].timestamp,
      open: chunk[0].open,
      high: Math.max(...chunk.map((item) => item.high)),
      low: Math.min(...chunk.map((item) => item.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((sum, item) => sum + (item.volume || 0), 0),
      oi: chunk.reduce((sum, item) => sum + (item.oi || 0), 0),
    };

    // Push the new data into the new array
    newCandles.push(combined);
  }
  return newCandles;
};

export const compareCandleArrays = (
  customArr: OPENALGO.history.historyCandles[],
  brokerArr: OPENALGO.history.historyCandles[],
) => {
  // 1. Check if lengths match
  if (customArr.length !== brokerArr.length) {
    return {
      isValid: false,
      reason: `Length mismatch. Custom array has ${customArr.length} candles, but Broker array has ${brokerArr.length}.`,
    };
  }

  const epsilon = 0.000001; // Tolerance threshold for rounding differences

  // Helper function to check if two numbers are practically equal
  const closeEnough = (a: number, b: number) => Math.abs((a || 0) - (b || 0)) < epsilon;

  // 2. Loop through every candle and compare properties
  for (let i = 0; i < customArr.length; i++) {
    const c = customArr[i];
    const b = brokerArr[i];

    const mismatches = [];

    if (c.timestamp != b.timestamp) mismatches.push(`open (${c.open} vs ${b.open})`);
    if (c.open != b.open) mismatches.push(`open (${c.open} vs ${b.open})`);
    if (c.high != b.high) mismatches.push(`high (${c.high} vs ${b.high})`);
    if (c.low != b.low) mismatches.push(`low (${c.low} vs ${b.low})`);
    if (c.close != b.close) mismatches.push(`close (${c.close} vs ${b.close})`);
    //if (c.volume != b.volume) mismatches.push(`volume (${c.volume} vs ${b.volume})`);
    if (c.oi != b.oi) mismatches.push(`oi (${c.oi} vs ${b.oi})`);

    // If any mismatch is found in this candle, return immediately
    if (mismatches.length > 0) {
      return { isValid: false, reason: `Value mismatch at index ${i}. Fields: ${mismatches.join(", ")}` };
    }
  }

  // 3. If the loop completes with no mismatches
  return { isValid: true, reason: "Success! Both arrays are identical and values match perfectly." };
};
