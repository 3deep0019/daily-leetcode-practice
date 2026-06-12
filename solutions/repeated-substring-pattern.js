/**
 * Problem: Repeated Substring Pattern
 * Difficulty: Easy
 * Topics: String, String Matching
 * * Description:
 * Given a string s, check if it can be constructed by taking a substring of it and appending multiple copies of the substring together.
 * 
 *  
 * Example 1:
 * 
 * Input: s = &quot;abab&quot;
 * Output: true
 * Explanation: It is the substring &quot;ab&quot; twice.
 * 
 * Example 2:
 * 
 * Input: s = &quot;aba&quot;
 * Output: false
 * 
 * Example 3:
 * 
 * Input: s = &quot;abcabcabcabc&quot;
 * Output: true
 * Explanation: It is the substring &quot;abc&quot; four times or the substring &quot;abcabc&quot; twice.
 * 
 *  
 * Constraints:
 * 
 * 	1 <= s.length <= 104
 * 	s consists of lowercase English letters.
 */

/**
 * @param {string} s
 * @return {boolean}
 */
var repeatedSubstringPattern = function (s) {
    let n = s.length;

    for (let len = 1; len <= n / 2; len++) {
        if (n % len === 0) {
            let pattern = s.substring(0, len);
            let temp = pattern.repeat(n / len);

            if (temp === s) return true;
        }
    }

    return false;
};

module.exports = { repeatedSubstringPattern };
