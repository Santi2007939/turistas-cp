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
   * Extract problem information from Codeforces URL
   * @param {string} url - Codeforces problem URL
   * @returns {Promise<object>} Problem data including name, rating, tags
   */
  async getProblemFromUrl(url) {
    try {
      // Parse URL to extract contestId and index
      // Examples:
      // https://codeforces.com/problemset/problem/1234/A
      // https://codeforces.com/contest/1234/problem/A
      // https://codeforces.com/gym/123456/problem/A
      const urlPattern = /codeforces\.com\/(?:problemset\/problem|contest|gym)\/(\d+)\/([A-Za-z]\d?)/i;
      const match = url.match(urlPattern);

      if (!match) {
        throw new Error('Invalid Codeforces URL format');
      }

      const contestId = match[1];
      const index = match[2];

      // Fetch problem details from API
      const response = await axios.get(`${CODEFORCES_API}/problemset.problems`);

      if (response.data.status !== 'OK') {
        throw new Error(response.data.comment || 'Failed to fetch problems');
      }

      const problem = response.data.result.problems.find(
        p => p.contestId === parseInt(contestId) && p.index === index
      );

      if (!problem) {
        throw new Error('Problem not found in Codeforces database');
      }

      // Return formatted problem data
      return {
        title: `${problem.contestId}${problem.index} - ${problem.name}`,
        platform: 'codeforces',
        platformId: `${problem.contestId}${problem.index}`,
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        rating: problem.rating || null,
        tags: problem.tags || [],
        timeLimit: problem.timeLimit ? `${problem.timeLimit / 1000}s` : null,
        memoryLimit: problem.memoryLimit ? `${problem.memoryLimit}MB` : null
      };
    } catch (error) {
      console.error('Codeforces getProblemFromUrl error:', error.message);
      throw new Error(`Failed to fetch problem from URL: ${error.message}`);
    }
  }
}

export default new CodeforcesService();
