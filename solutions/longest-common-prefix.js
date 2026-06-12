/**
 * Problem: Longest Common Prefix
 * Difficulty: Easy
 * Topics: Array, String, Trie
 * * Description:
 * Write a function to find the longest common prefix string amongst an array of strings.
 * 
 * If there is no common prefix, return an empty string &quot;&quot;.
 * 
 *  
 * Example 1:
 * 
 * Input: strs = [&quot;flower&quot;,&quot;flow&quot;,&quot;flight&quot;]
 * Output: &quot;fl&quot;
 * 
 * Example 2:
 * 
 * Input: strs = [&quot;dog&quot;,&quot;racecar&quot;,&quot;car&quot;]
 * Output: &quot;&quot;
 * Explanation: There is no common prefix among the input strings.
 * 
 *  
 * Constraints:
 * 
 * 	1 <= strs.length <= 200
 * 	0 <= strs[i].length <= 200
 * 	strs[i] consists of only lowercase English letters if it is non-empty.
 */

/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
    if (!strs.length) return '';
    let prefix = strs[0];
    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1);
            if (!prefix) return '';
        }
    }
    return prefix;
};

module.exports = { longestCommonPrefix };
