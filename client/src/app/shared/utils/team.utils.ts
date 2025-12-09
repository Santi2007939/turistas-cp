import { TeamConfig, TeamMember } from '../../core/services/team.service';

/**
 * Utility functions for team operations
 */
export class TeamUtils {
  /**
   * Check if a user is a member of a team
   * Handles both string userId and populated user objects
   */
  static isUserInTeam(team: TeamConfig, userId: string | null): boolean {
    if (!userId || !team || !team.members) {
      return false;
    }

    return team.members.some(member => {
      // Handle both populated user objects and string IDs
      const memberId = typeof member.userId === 'string' 
        ? member.userId 
        : member.userId?._id || member.userId?.id;
      
      return memberId === userId;
    });
  }

  /**
   * Get user's role in a team
   */
  static getUserRole(team: TeamConfig, userId: string | null): 'leader' | 'member' | null {
    if (!userId || !team || !team.members) {
      return null;
    }

    const member = team.members.find(m => {
      const memberId = typeof m.userId === 'string' 
        ? m.userId 
        : m.userId?._id || m.userId?.id;
      return memberId === userId;
    });

    return member ? member.role : null;
  }
}
