/**
 * @typedef {'digital'|'analog'} ClockStyle
 * @typedef {'name'|'icon'|'both'} QuickLinkDisplay
 * @typedef {{title: string, url: string, icon?: string, display?: QuickLinkDisplay}} QuickLink
 *
 * @typedef {Object} Settings
 * @property {string} name
 * @property {boolean} setupComplete
 * @property {boolean} showClock
 * @property {boolean} showGreeting
 * @property {boolean} showSearch
 * @property {boolean} showSearchHint
 * @property {boolean} showQuickLinks
 * @property {boolean} showWeather
 * @property {boolean} showPhotoCredit
 * @property {boolean} showReroll
 * @property {boolean} showSettingsButton
 * @property {boolean} showBackground
 * @property {boolean} use24h
 * @property {boolean} showSeconds
 * @property {ClockStyle} clockStyle
 * @property {'unsplash'|'custom'} bgSource
 * @property {string} bgCategory
 * @property {string[]} customImages
 * @property {string} searchEngine
 * @property {string} aiProvider
 * @property {string} fontPreset
 * @property {string} googleFontName
 * @property {string} customFontDataUrl
 * @property {string} customFontFormat
 * @property {'web'|'ai'} searchMode
 * @property {{url: string, credit: string, link: string, dayKey: string, category: string}|null} lastUnsplash
 * @property {{url: string, credit: string, link: string, dayKey: string, category: string}|null} lastCustom
 * @property {string[]} recentUnsplashUrls
 * @property {boolean} newPhotoOnOpen
 * @property {QuickLink[]} quickLinks
 */

export {};
