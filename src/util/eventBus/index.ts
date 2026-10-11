import { EventBussClassTemplate } from "../../../../tradeServer/src/util/eventBus/eventBusTemplate";

declare global {
  var __tradeFrontendEventBus: EventBussClassTemplate | undefined;
}

const eventBus = globalThis.__tradeFrontendEventBus ?? new EventBussClassTemplate();
globalThis.__tradeFrontendEventBus = eventBus;

export default eventBus;
