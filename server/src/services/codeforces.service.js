import axios from 'axios';

const CODEFORCES_API = 'https://codeforces.com/api';

class CodeforcesService {
  /**
   * Get user information from Codeforces
   * @param {string} handle - Codeforces handle
   */
  async getUserInfo(handle) {
    try {
      const response = await axios.get(`${CODEFORCES_API}/user.info`, {
        params: { handles: handle }
      });

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'Failed to fetch user info');
      }

      return response.data.result[0];
    } catch (error) {
      console.error('Codeforces getUserInfo error:', error.message);
      throw new Error(`Failed to fetch Codeforces user info: ${error.message}`);
    }
  }

  /**
   * Get user rating history
   * @param {string} handle - Codeforces handle
   */
  async getRatingHistory(handle) {
    try {
      const response = await axios.get(`${CODEFORCES_API}/user.rating`, {
        params: { handle }
      });

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'Failed to fetch rating history');
      }

      return response.data.result;
    } catch (error) {
      console.error('Codeforces getRatingHistory error:', error.message);
      throw new Error(`Failed to fetch rating history: ${error.message}`);
    }
  }

  /**
   * Get upcoming contests
   * @param {boolean} gym - Include gym contests
   */
  async getUpcomingContests(gym = false) {
    try {
      const response = await axios.get(`${CODEFORCES_API}/contest.list`, {
        params: { gym }
      });

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'Failed to fetch contests');
      }

      // Filter only upcoming contests (phase: BEFORE)
      const upcomingContests = response.data.result.filter(
        contest => contest.phase === 'BEFORE'
      );

      return upcomingContests;
    } catch (error) {
      console.error('Codeforces getUpcomingContests error:', error.message);
      throw new Error(`Failed to fetch upcoming contests: ${error.message}`);
    }
  }

  /**
   * Get user submissions
   * @param {string} handle - Codeforces handle
   * @param {number} from - Starting index (1-based)
   * @param {number} count - Number of submissions to fetch
   */
  async getUserSubmissions(handle, from = 1, count = 100) {
    try {
      const response = await axios.get(`${CODEFORCES_API}/user.status`, {
        params: { handle, from, count }
      });

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'Failed to fetch submissions');
      }

      return response.data.result;
    } catch (error) {
      console.error('Codeforces getUserSubmissions error:', error.message);
      throw new Error(`Failed to fetch user submissions: ${error.message}`);
    }
  }

  /**
   * Get problem statistics
   * @param {string} contestId - Contest ID
   * @param {string} index - Problem index (A, B, C, etc.)
   */
  async getProblemStatistics(contestId, index) {
    try {
      const response = await axios.get(`${CODEFORCES_API}/problemset.problems`);

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'Failed to fetch problems');
      }

      const problem = response.data.result.problems.find(
        p => p.contestId === parseInt(contestId) && p.index === index
      );

      return problem;
    } catch (error) {
      console.error('Codeforces getProblemStatistics error:', error.message);
      throw new Error(`Failed to fetch problem statistics: ${error.message}`);
    }
  }

  /**
   * Get problem details from Codeforces
   * @param {string} contestId - Contest ID
   * @param {string} index - Problem index (A, B, C, etc.)
   */
  async getProblemDetails(contestId, index) {
    try {
      const response = await axios.get(`${CODEFORCES_API}/problemset.problems`);

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'Failed to fetch problems');
      }

      const problem = response.data.result.problems.find(
        p => p.contestId === parseInt(contestId) && p.index === index.toUpperCase()
      );

      if (!problem) {
        throw new Error('Problem not found');
      }

      const problemStats = response.data.result.problemStatistics.find(
        s => s.contestId === parseInt(contestId) && s.index === index.toUpperCase()
      );

      return {
        title: problem.name,
        tags: problem.tags || [],
        rating: problem.rating || null,
        solveCount: problemStats?.solvedCount || 0,
        contestId: problem.contestId,
        index: problem.index,
        type: problem.type
      };
    } catch (error) {
      console.error('Codeforces getProblemDetails error:', error.message);
      throw new Error(`Failed to fetch problem details: ${error.message}`);
    }
  }
}

export default new CodeforcesService();
