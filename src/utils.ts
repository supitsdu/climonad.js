export namespace Utils {
	/**
	 * Merges an array of aliases by applying a filter function to each defined alias.
	 *
	 * @template T - The type of the aliases.
	 * @param {Array<T | undefined>} aliases - An array of aliases, which may include undefined values.
	 * @param {(alias: T) => T} filter - A filter function to apply to each defined alias.
	 * @returns {T[]} An array of filtered aliases.
	 */
	export function mergeAliases<T>(aliases: (T | undefined)[], filter: (alias: T) => T): T[] {
		const result: T[] = []

		for (let i = 0; i < aliases.length; i++) {
			const alias = aliases[i]
			if (alias === undefined) continue
			result.push(filter(alias))
		}

		return result
	}

	/**
	 * Converts a given character to its corresponding number in the alphabet.
	 *
	 * @param char - The character to convert. Should be a single alphabetical character.
	 * @returns The numerical position of the character in the alphabet (1 for 'a', 2 for 'b', ..., 26 for 'z').
	 *          Returns 0 if the character is not a letter.
	 */
	export function charToNumber(char: string): number {
		const code = char.toLowerCase().charCodeAt(0)
		return code >= 97 && code <= 122 ? code - 96 : 0 // 'a' -> 1, ..., 'z' -> 26
	}

	/**
	 * Calculates a similarity score between two strings based on their character codes.
	 * The score is normalized between 0 and 1.
	 *
	 * @param target - The target string to compare against.
	 * @param candidate - The candidate string to compare.
	 * @returns The similarity score between the target and candidate strings.
	 *
	 * The scoring mechanism is as follows:
	 * - Exact match of character codes: +1 point
	 * - Close match (difference of 2 or less in character codes): +0.5 points
	 * - The score is then divided by the length of the longer string to normalize it.
	 */
	export function calculateScore(target: string, candidate: string): number {
		const targetNums = target.split("").map(charToNumber)
		const candidateNums = candidate.split("").map(charToNumber)

		let score = 0
		const maxLength = Math.max(targetNums.length, candidateNums.length)

		for (let i = 0; i < maxLength; i++) {
			const t = targetNums[i] || 0 // Default to 0 if out of bounds
			const c = candidateNums[i] || 0

			if (t === c) {
				score += 1 // Exact match
			} else if (Math.abs(t - c) <= 2) {
				score += 0.5 // Close match
			}
		}

		return score / maxLength // Normalize score between 0 and 1
	}

	/**
	 * Finds the closest matching string from a set of candidate strings based on the first and last letters of the target string.
	 *
	 * @param target - The target string to match against.
	 * @param candidates - An iterable iterator of candidate strings.
	 * @returns The closest matching string or `null` if no valid candidates are found.
	 */
	export function closestString(target: string, candidates: IterableIterator<string>): string | null {
		const targetStart = target[0]?.toLowerCase()
		const targetEnd = target[target.length - 1]?.toLowerCase()

		// Create a Set to store filtered candidates
		const filteredCandidates = new Set<string>()

		// Use forEach to filter candidates and store them in the Set
		for (const candidate of candidates) {
			const candidateStart = candidate[0]?.toLowerCase()
			const candidateEnd = candidate[candidate.length - 1]?.toLowerCase()

			// Only add to the Set if the candidate matches the first and last letter
			if (candidateStart === targetStart && candidateEnd === targetEnd) {
				filteredCandidates.add(candidate)
			}
		}

		if (filteredCandidates.size === 0) {
			return null // No valid candidates
		}

		let bestMatch: string | null = null
		let highestScore = 0

		// Iterate through the filtered candidates in the Set
		filteredCandidates.forEach(candidate => {
			const score = calculateScore(target, candidate)
			if (score > highestScore) {
				highestScore = score
				bestMatch = candidate
			}
		})

		return bestMatch
	}
}
