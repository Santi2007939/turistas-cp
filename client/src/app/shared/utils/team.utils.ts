import { TeamConfig, TeamMember } from '../../core/services/team.service';

/**
 * Utility functions for team operations
 */
export class TeamUtils {
  /**
   * Check if user is a member of a team (excluding admin users)
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
   * Check if user is active in a team
   */
  static isUserActive(team: TeamConfig, userId: string | null): boolean {
    if (!userId || !team || !team.members) {
      return false;
    }

    const member = team.members.find(m => {
      const memberId = typeof m.userId === 'string' 
        ? m.userId 
        : m.userId?._id || m.userId?.id;
      return memberId === userId;
    });

    return member ? (member.isActive === true) : false;
  }
}
