//@ts-ignore
import OpenAlgo from "openalgo";
import { uuidWithSpecifiedSize } from "../util/uuid";

const openAlgoClient = new (class openAlgoClass {
  public classID = uuidWithSpecifiedSize({ size: 12 });

  private client1: any = undefined;

  constructor() {
    console.log("Open Algo Class Constructor");
    this.client1 = new OpenAlgo(
      "66a729fc8f34b86d82276c0e756e09adf3e015fca30085b3263e22be5dadf239",
      "http://127.0.0.1:5001",
    );
  }

  getClient() {
    return this.client1;
  }
})();

export default openAlgoClient;
