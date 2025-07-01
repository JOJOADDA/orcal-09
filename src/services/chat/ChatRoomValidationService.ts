
export class ChatRoomValidationService {
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static handleError(error: any, context: string) {
    console.error(`[ChatRoomService ${context}] Error:`, error);
    return error;
  }
}
