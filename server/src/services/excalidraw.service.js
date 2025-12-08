import crypto from 'crypto';

class ExcalidrawService {
  /**
   * Create a new Excalidraw collaborative room
   * @param {string} roomName - Name for the room
   * @param {string} teamId - Team ID for tracking
   */
  async createRoom(roomName, teamId) {
    try {
      // Generate a unique room ID
      const roomId = this.generateRoomId();
      
      // Excalidraw uses a simple URL structure for rooms
      // The actual collaboration is handled client-side through their servers
      const roomUrl = `https://excalidraw.com/#room=${roomId},${this.generateRoomKey()}`;

      return {
        roomId,
        roomName,
        teamId,
        url: roomUrl,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Excalidraw createRoom error:', error.message);
      throw new Error(`Failed to create Excalidraw room: ${error.message}`);
    }
  }

  /**
   * Generate a unique room ID
   */
  generateRoomId() {
    // Generate a random 20-character ID
    return crypto.randomBytes(10).toString('hex');
  }

  /**
   * Generate a room encryption key
   */
  generateRoomKey() {
    // Generate a random 22-character key (base64url)
    return crypto.randomBytes(16).toString('base64url');
  }

  /**
   * Get room information
   * @param {string} roomId - Room ID
   */
  async getRoomInfo(roomId) {
    try {
      // Since Excalidraw rooms are client-side, we can only return basic info
      // The actual collaboration data is stored on Excalidraw's servers
      return {
        roomId,
        status: 'active',
        message: 'Room is accessible via the provided URL'
      };
    } catch (error) {
      console.error('Excalidraw getRoomInfo error:', error.message);
      throw new Error(`Failed to get room info: ${error.message}`);
    }
  }

  /**
   * Generate a shareable link for a room
   * @param {string} roomId - Room ID
   * @param {string} roomKey - Room encryption key
   */
  getShareableLink(roomId, roomKey) {
    return `https://excalidraw.com/#room=${roomId},${roomKey}`;
  }

  /**
   * Parse room URL to extract ID and key
   * @param {string} url - Excalidraw room URL
   */
  parseRoomUrl(url) {
    try {
      const match = url.match(/#room=([^,]+),([^&]+)/);
      if (!match) {
        throw new Error('Invalid Excalidraw room URL');
      }

      return {
        roomId: match[1],
        roomKey: match[2]
      };
    } catch (error) {
      console.error('Excalidraw parseRoomUrl error:', error.message);
      throw new Error(`Failed to parse room URL: ${error.message}`);
    }
  }
}

export default new ExcalidrawService();
