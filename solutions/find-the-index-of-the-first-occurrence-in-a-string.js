/**
 * Problem: Find the Index of the First Occurrence in a String
 * Difficulty: Easy
 * Topics: Two Pointers, String, String Matching
 * * Description:
 * Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.
 * 
 *  
 * Example 1:
 * 
 * Input: haystack = &quot;sadbutsad&quot;, needle = &quot;sad&quot;
 * Output: 0
 * Explanation: &quot;sad&quot; occurs at index 0 and 6.
 * The first occurrence is at index 0, so we return 0.
 * 
 * Example 2:
 * 
 * Input: haystack = &quot;leetcode&quot;, needle = &quot;leeto&quot;
 * Output: -1
 * Explanation: &quot;leeto&quot; did not occur in &quot;leetcode&quot;, so we return -1.
 * 
 *  
 * Constraints:
 * 
 * 	1 <= haystack.length, needle.length <= 104
 * 	haystack and needle consist of only lowercase English characters.
 */

/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
var strStr = function(haystack, needle) {
    if (needle.length > haystack.length) return -1;
    return haystack.indexOf(needle)
};

module.exports = { strStr };
