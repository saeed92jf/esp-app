'use client';

import { useState, useEffect, useRef } from 'react';
import { VideoItem } from '@/types';
import {
  formatEnglishDuration,
  formatEnglishViews,
  formatEnglishDate,
} from '@/utils/englishDate';
import { AutoText } from '@/components/custom/AutoText/AutoText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faClock,
  faTimesCircle,
  faArrowUp,
  faArrowDown,
  faEye,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

interface SearchPopupProps {
  onVideoSelect: (video: VideoItem) => void;
  videos?: VideoItem[];
}

// تابع هایلایت متن
const highlightText = (text: string, query: string) => {
  if (!query || query.length < 2 || !text) return text;

  try {
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi',
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="rounded bg-yellow-200 px-0 text-gray-900 dark:bg-yellow-800/50 dark:text-white"
        >
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  } catch {
    return text;
  }
};

// ارتفاع ثابت سرچ باکس (بر حسب px)
const SEARCH_BOX_HEIGHT = 48;

export function SearchPopup({ onVideoSelect, videos = [] }: SearchPopupProps) {
  // State Management
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedRecentIndex, setSelectedRecentIndex] = useState(-1);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load search history
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Save to history
  const addToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const newHistory = [
      searchQuery,
      ...recentSearches.filter((h) => h !== searchQuery),
    ].slice(0, 10);
    setRecentSearches(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Clear all search history
  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('searchHistory');
  };

  // Filter videos
  const performSearch = (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = videos.filter(
      (video) =>
        video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description &&
          video.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    setSearchResults(results);
  };

  useEffect(() => {
    performSearch(query);
  }, [query]);

  // Auto-select based on current state
  useEffect(() => {
    const hasResults = searchResults.length > 0;
    const hasNoResults = query.length >= 2 && searchResults.length === 0;
    const hasRecent = recentSearches.length > 0 && query.length < 2;

    if (hasResults) {
      setSelectedIndex(0);
      setSelectedRecentIndex(-1);
    } else if (hasNoResults) {
      setSelectedIndex(0);
      setSelectedRecentIndex(-1);
    } else if (hasRecent) {
      setSelectedRecentIndex(0);
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(-1);
      setSelectedRecentIndex(-1);
    }
  }, [searchResults, query, recentSearches]);

  // Scroll to selected item when it changes
  useEffect(() => {
    if (selectedItemRef.current && isKeyboardMode) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, selectedRecentIndex, isKeyboardMode]);

  // Handle cursor visibility
  useEffect(() => {
    if (cursorHidden) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.cursor = '';
    };
  }, [cursorHidden]);

  // Detect mouse movement to exit keyboard mode
  const handleMouseMove = () => {
    if (isKeyboardMode) {
      setIsKeyboardMode(false);
      setCursorHidden(false);
    }

    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
      }
    };
  }, []);

  const shouldShowDropdown =
    isFocused &&
    (query.length >= 2 || (query.length < 2 && recentSearches.length > 0));

  const handleFocus = () => {
    setIsFocused(true);
    // Reset keyboard mode when focusing
    setIsKeyboardMode(false);
    setCursorHidden(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setIsKeyboardMode(false);
      setCursorHidden(false);
    }, 200);
  };

  const clearQueryOnly = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedIndex(-1);
    setSelectedRecentIndex(-1);
    inputRef.current?.focus();
  };

  const resetSearch = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedIndex(-1);
    setSelectedRecentIndex(-1);
    setIsFocused(false);
    setIsKeyboardMode(false);
    setCursorHidden(false);
  };

  const handleSelectVideo = (video: VideoItem) => {
    addToHistory(query);
    onVideoSelect(video);
    resetSearch();
    inputRef.current?.blur();
  };

  const handleSelectRecent = (item: string) => {
    setQuery(item);
    performSearch(item);
    setIsFocused(true);
    setIsKeyboardMode(false);
    setCursorHidden(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const hasResults = searchResults.length > 0;
    const hasNoResults = query.length >= 2 && searchResults.length === 0;
    const hasRecent = recentSearches.length > 0 && query.length < 2;

    let totalItems = 0;
    if (hasResults) totalItems = searchResults.length;
    else if (hasNoResults)
      totalItems = 1 + (hasRecent ? recentSearches.length : 0);
    else if (hasRecent) totalItems = recentSearches.length;

    // Enter keyboard mode on any arrow key press
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      setIsKeyboardMode(true);
      setCursorHidden(true);

      // Reset keyboard mode after inactivity (3 seconds without keyboard input)
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
      }
      keyboardTimeoutRef.current = setTimeout(() => {
        setIsKeyboardMode(false);
        setCursorHidden(false);
      }, 3000);
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (totalItems > 0) {
          if (hasResults && selectedIndex < searchResults.length - 1) {
            setSelectedIndex((prev) => prev + 1);
          } else if (hasNoResults) {
            if (selectedIndex === 0 && recentSearches.length > 0) {
              setSelectedIndex(-1);
              setSelectedRecentIndex(0);
            } else if (selectedRecentIndex < recentSearches.length - 1) {
              setSelectedRecentIndex((prev) => prev + 1);
            }
          } else if (
            hasRecent &&
            selectedRecentIndex < recentSearches.length - 1
          ) {
            setSelectedRecentIndex((prev) => prev + 1);
          }
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (totalItems > 0) {
          if (hasResults && selectedIndex > 0) {
            setSelectedIndex((prev) => prev - 1);
          } else if (hasNoResults) {
            if (selectedRecentIndex === 0) {
              setSelectedRecentIndex(-1);
              setSelectedIndex(0);
            } else if (selectedRecentIndex > 0) {
              setSelectedRecentIndex((prev) => prev - 1);
            }
          } else if (hasRecent && selectedRecentIndex > 0) {
            setSelectedRecentIndex((prev) => prev - 1);
          }
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (
          hasNoResults &&
          selectedRecentIndex >= 0 &&
          recentSearches[selectedRecentIndex]
        ) {
          handleSelectRecent(recentSearches[selectedRecentIndex]);
        } else if (
          hasResults &&
          selectedIndex >= 0 &&
          searchResults[selectedIndex]
        ) {
          handleSelectVideo(searchResults[selectedIndex]);
        } else if (
          hasRecent &&
          selectedRecentIndex >= 0 &&
          recentSearches[selectedRecentIndex]
        ) {
          handleSelectRecent(recentSearches[selectedRecentIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        clearQueryOnly();
        break;
    }
  };

  const handleRecentSearchClick = (item: string) => {
    setQuery(item);
    performSearch(item);
    setIsFocused(true);
    setIsKeyboardMode(false);
    setCursorHidden(false);
    inputRef.current?.focus();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src =
      'https://via.placeholder.com/640x360?text=No+Thumbnail';
  };

  const handleMouseEnterResult = (index: number) => {
    // Only allow mouse selection when not in keyboard mode
    if (!isKeyboardMode) {
      setSelectedIndex(index);
      setSelectedRecentIndex(-1);
    }
  };

  const handleMouseEnterRecent = (index: number) => {
    // Only allow mouse selection when not in keyboard mode
    if (!isKeyboardMode) {
      setSelectedRecentIndex(index);
      setSelectedIndex(-1);
    }
  };

  const handleMouseLeaveContainer = () => {
    // Do nothing on leave
  };

  const hasSearchResults = query.length >= 2 && searchResults.length > 0;
  const hasNoResults = query.length >= 2 && searchResults.length === 0;
  const hasRecentSearches =
    (query.length < 2 || hasNoResults) && recentSearches.length > 0;
  const uniqueResults = Array.from(
    new Map(searchResults.map((v) => [v.id, v])).values(),
  );

  const commonBorderStyle = 'border border-gray-200 dark:border-gray-700';

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseMove={handleMouseMove}
    >
      {/* Search Input */}
      <div
        className={`bg-white transition-shadow duration-200 dark:bg-gray-900 ${shouldShowDropdown ? 'rounded-t-3xl rounded-b-none' : 'rounded-3xl'} ${commonBorderStyle} ${shouldShowDropdown ? 'border-b-0' : ''} `}
      >
        <div
          className="relative flex items-center"
          style={{ height: SEARCH_BOX_HEIGHT }}
        >
          <div className="pointer-events-none absolute left-4 flex items-center">
            <FontAwesomeIcon
              icon={faSearch}
              className="h-5 w-5 text-gray-400"
            />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search"
            className={`font-poppins h-full w-full bg-transparent pr-4 pl-11 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white`}
            style={{ cursor: cursorHidden ? 'none' : 'text' }}
          />
        </div>
      </div>

      {/* Dropdown Results */}
      {shouldShowDropdown && (
        <div
          ref={resultsContainerRef}
          onMouseLeave={handleMouseLeaveContainer}
          className={`absolute right-0 left-0 rounded-b-3xl bg-white shadow-lg dark:bg-gray-900 ${commonBorderStyle} animate-fade-in-up z-50 overflow-hidden border-t-0`}
          style={{ top: `${SEARCH_BOX_HEIGHT}px` }}
        >
          <div className="max-h-96 overflow-y-auto">
            {/* Search Results - وقتی نتیجه دارد */}
            {hasSearchResults && (
              <>
                <div className="bg-gray-50 px-4 py-2 dark:bg-gray-800/50">
                  <p className="font-english text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Search Results ({uniqueResults.length})
                  </p>
                </div>
                {uniqueResults.map((video, idx) => {
                  const isSelected = selectedIndex === idx;

                  return (
                    <div
                      key={`${video.id}-${idx}`}
                      ref={
                        isSelected && isKeyboardMode ? selectedItemRef : null
                      }
                      onClick={() => handleSelectVideo(video)}
                      onMouseEnter={() => handleMouseEnterResult(idx)}
                      className={`duration-instant flex w-full cursor-pointer gap-3 border-l-4 border-transparent px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-light border-primary border-l-4'
                          : 'bg-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      style={{ cursor: isKeyboardMode ? 'none' : 'pointer' }}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative w-16 shrink-0">
                        <img
                          src={
                            video.small_poster ||
                            video.big_poster ||
                            'https://via.placeholder.com/640x360?text=No+Thumbnail'
                          }
                          alt={video.title}
                          className="h-12 w-full rounded-lg object-cover"
                          onError={handleImageError}
                          loading="lazy"
                        />
                        {/* Duration Badge */}
                        <div className="font-english absolute right-0 bottom-0 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="mr-1 h-2 w-2"
                          />
                          {formatEnglishDuration(video.duration)}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="min-w-0 flex-1">
                        <AutoText
                          text={highlightText(video.title, query) as string}
                          as="div"
                          className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white"
                        />
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                            {formatEnglishViews(video.visit_cnt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="h-3 w-3"
                            />
                            {formatEnglishDate(video.sdate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* No Results + Recent Searches */}
            {hasNoResults && (
              <>
                {/* No Result Item */}
                <div
                  ref={
                    selectedIndex === 0 &&
                    selectedRecentIndex === -1 &&
                    isKeyboardMode
                      ? selectedItemRef
                      : null
                  }
                  className={`flex w-full cursor-default items-center gap-3 border-l-4 border-transparent px-4 py-3 text-left ${
                    selectedIndex === 0 && selectedRecentIndex === -1
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 border-l-4'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className="h-4 w-4 text-gray-400"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      No results for "
                      <span className="font-semibold">{query}</span>"
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      Try different keywords
                    </div>
                  </div>
                </div>

                {/* Recent Searches Header */}
                {recentSearches.length > 0 && (
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-2 dark:bg-gray-800/50">
                    <p className="font-english text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      Recent
                    </p>
                    <button
                      onClick={clearHistory}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-english text-xs"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Recent Searches Items */}
                {recentSearches.map((item, idx) => {
                  const isSelected = selectedRecentIndex === idx;

                  return (
                    <div
                      key={idx}
                      ref={
                        isSelected && isKeyboardMode ? selectedItemRef : null
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={() => handleRecentSearchClick(item)}
                      onMouseEnter={() => handleMouseEnterRecent(idx)}
                      className={`duration-instant flex w-full cursor-pointer items-center gap-3 border-l-4 border-transparent px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 border-l-4'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      style={{ cursor: isKeyboardMode ? 'none' : 'pointer' }}
                    >
                      <FontAwesomeIcon
                        icon={faClock}
                        className="h-4 w-4 text-gray-400"
                      />
                      <AutoText
                        text={item}
                        as="span"
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  );
                })}
              </>
            )}

            {/* Recent Searches - فقط وقتی query خالی است */}
            {!hasNoResults && query.length < 2 && recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2 dark:bg-gray-800/50">
                  <p className="font-english text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Recent
                  </p>
                  <button
                    onClick={clearHistory}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-english text-xs"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((item, idx) => {
                  const isSelected = selectedRecentIndex === idx;

                  return (
                    <div
                      key={idx}
                      ref={
                        isSelected && isKeyboardMode ? selectedItemRef : null
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={() => handleRecentSearchClick(item)}
                      onMouseEnter={() => handleMouseEnterRecent(idx)}
                      className={`duration-instant flex w-full cursor-pointer items-center gap-3 border-l-4 border-transparent px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 border-l-4'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      style={{ cursor: isKeyboardMode ? 'none' : 'pointer' }}
                    >
                      <FontAwesomeIcon
                        icon={faClock}
                        className="h-4 w-4 text-gray-400"
                      />
                      <AutoText
                        text={item}
                        as="span"
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="font-english flex justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800/30">
            <span>
              <FontAwesomeIcon icon={faArrowUp} className="mr-1 h-3 w-3" />
              <FontAwesomeIcon icon={faArrowDown} className="mr-1 h-3 w-3" />
              to navigate
            </span>
            <span>Enter to select</span>
            <span>Esc to clear</span>
          </div>
        </div>
      )}
    </div>
  );
}
