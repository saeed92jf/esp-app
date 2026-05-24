'use client';

import { useState, useEffect, useRef } from 'react';
import { VideoItem } from '@/types';
import { formatEnglishDuration, formatEnglishViews, formatEnglishDate } from '@/utils/englishDate';
import { AutoText } from '@/components/ui/AutoText/AutoText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faClock, faTimesCircle, faArrowUp, faArrowDown, faEye, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

interface SearchPopupProps {
  onVideoSelect: (video: VideoItem) => void;
  videos?: VideoItem[];
}

// تابع هایلایت متن
const highlightText = (text: string, query: string) => {
  if (!query || query.length < 2 || !text) return text;
  
  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/50 text-gray-900 dark:text-white px-0 rounded">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
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
    const newHistory = [searchQuery, ...recentSearches.filter(h => h !== searchQuery)].slice(0, 10);
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
    
    const results = videos.filter((video) => 
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const shouldShowDropdown = isFocused && (
    query.length >= 2 ||
    (query.length < 2 && recentSearches.length > 0)
  );

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
    else if (hasNoResults) totalItems = 1 + (hasRecent ? recentSearches.length : 0);
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
            setSelectedIndex(prev => prev + 1);
          } else if (hasNoResults) {
            if (selectedIndex === 0 && recentSearches.length > 0) {
              setSelectedIndex(-1);
              setSelectedRecentIndex(0);
            } else if (selectedRecentIndex < recentSearches.length - 1) {
              setSelectedRecentIndex(prev => prev + 1);
            }
          } else if (hasRecent && selectedRecentIndex < recentSearches.length - 1) {
            setSelectedRecentIndex(prev => prev + 1);
          }
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (totalItems > 0) {
          if (hasResults && selectedIndex > 0) {
            setSelectedIndex(prev => prev - 1);
          } else if (hasNoResults) {
            if (selectedRecentIndex === 0) {
              setSelectedRecentIndex(-1);
              setSelectedIndex(0);
            } else if (selectedRecentIndex > 0) {
              setSelectedRecentIndex(prev => prev - 1);
            }
          } else if (hasRecent && selectedRecentIndex > 0) {
            setSelectedRecentIndex(prev => prev - 1);
          }
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (hasNoResults && selectedRecentIndex >= 0 && recentSearches[selectedRecentIndex]) {
          handleSelectRecent(recentSearches[selectedRecentIndex]);
        } 
        else if (hasResults && selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleSelectVideo(searchResults[selectedIndex]);
        } 
        else if (hasRecent && selectedRecentIndex >= 0 && recentSearches[selectedRecentIndex]) {
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
    e.currentTarget.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail';
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
  const hasRecentSearches = (query.length < 2 || hasNoResults) && recentSearches.length > 0;
  const uniqueResults = Array.from(new Map(searchResults.map(v => [v.id, v])).values());

  const commonBorderStyle = "border border-gray-200 dark:border-gray-700";

  return (
    <div 
      ref={containerRef} 
      className="relative w-full"
      onMouseMove={handleMouseMove}
    >
      
      {/* Search Input */}
      <div className={`
        transition-shadow duration-200 bg-white dark:bg-gray-900
        ${shouldShowDropdown ? 'rounded-t-3xl rounded-b-none' : 'rounded-3xl'}
        ${commonBorderStyle}
        ${shouldShowDropdown ? 'border-b-0' : ''}
      `}>
        <div className="relative flex items-center" style={{ height: SEARCH_BOX_HEIGHT }}>
          <div className="absolute left-4 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-gray-400" />
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
            className={`
              w-full h-full bg-transparent text-gray-900 dark:text-white 
              placeholder:text-gray-400 focus:outline-none 
              font-poppins text-base
              pl-11 pr-4
            `}
            style={{ cursor: cursorHidden ? 'none' : 'text' }}
          />
        </div>
      </div>
      
      {/* Dropdown Results */}
      {shouldShowDropdown && (
        <div 
          ref={resultsContainerRef}
          onMouseLeave={handleMouseLeaveContainer}
          className={`
            absolute left-0 right-0 bg-white dark:bg-gray-900 rounded-b-3xl shadow-lg 
            ${commonBorderStyle} border-t-0 overflow-hidden z-50 animate-fade-in-up
          `}
          style={{ top: `${SEARCH_BOX_HEIGHT}px` }}
        >
          <div className="max-h-96 overflow-y-auto">
            
            {/* Search Results - وقتی نتیجه دارد */}
            {hasSearchResults && (
              <>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-english">
                    Search Results ({uniqueResults.length})
                  </p>
                </div>
                {uniqueResults.map((video, idx) => {
                  const isSelected = selectedIndex === idx;
                  
                  return (
                    <div
                      key={`${video.id}-${idx}`}
                      ref={isSelected && isKeyboardMode ? selectedItemRef : null}
                      onClick={() => handleSelectVideo(video)}
                      onMouseEnter={() => handleMouseEnterResult(idx)}
                      className={`w-full px-4 py-3 flex gap-3 text-left cursor-pointer border-l-4 border-transparent transition-colors duration-0 ${
                        isSelected
                          ? 'bg-primary-light border-l-4 border-primary'
                          : 'bg-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      style={{ cursor: isKeyboardMode ? 'none' : 'pointer' }}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative w-16 shrink-0">
                        <img
                          src={video.small_poster || video.big_poster || 'https://via.placeholder.com/640x360?text=No+Thumbnail'}
                          alt={video.title}
                          className="w-full h-12 object-cover rounded-lg"
                          onError={handleImageError}
                          loading="lazy"
                        />
                        {/* Duration Badge */}
                        <div className="absolute bottom-0 right-0 px-1 py-0.5 bg-black/70 rounded text-white text-[10px] font-english">
                          <FontAwesomeIcon icon={faClock} className="w-2 h-2 mr-1" />
                          {formatEnglishDuration(video.duration)}
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <AutoText 
                          text={highlightText(video.title, query) as string}
                          as="div"
                          className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2"
                        />
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                            {formatEnglishViews(video.visit_cnt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
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
                  ref={selectedIndex === 0 && selectedRecentIndex === -1 && isKeyboardMode ? selectedItemRef : null}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left cursor-default border-l-4 border-transparent ${
                    selectedIndex === 0 && selectedRecentIndex === -1
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500'
                      : ''
                  }`}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      No results for "<span className="font-semibold">{query}</span>"
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Try different keywords
                    </div>
                  </div>
                </div>
                
                {/* Recent Searches Header */}
                {recentSearches.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-english">Recent</p>
                    <button onClick={clearHistory} className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-english">Clear</button>
                  </div>
                )}
                
                {/* Recent Searches Items */}
                {recentSearches.map((item, idx) => {
                  const isSelected = selectedRecentIndex === idx;
                  
                  return (
                    <div
                      key={idx}
                      ref={isSelected && isKeyboardMode ? selectedItemRef : null}
                      onMouseDown={(e) => { e.preventDefault(); }}
                      onClick={() => handleRecentSearchClick(item)}
                      onMouseEnter={() => handleMouseEnterRecent(idx)}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left cursor-pointer border-l-4 border-transparent transition-colors duration-0 ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      style={{ cursor: isKeyboardMode ? 'none' : 'pointer' }}
                    >
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-400" />
                      <AutoText text={item} as="span" className="text-gray-700 dark:text-gray-300" />
                    </div>
                  );
                })}
              </>
            )}

            {/* Recent Searches - فقط وقتی query خالی است */}
            {!hasNoResults && query.length < 2 && recentSearches.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-english">Recent</p>
                  <button onClick={clearHistory} className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-english">Clear</button>
                </div>
                {recentSearches.map((item, idx) => {
                  const isSelected = selectedRecentIndex === idx;
                  
                  return (
                    <div
                      key={idx}
                      ref={isSelected && isKeyboardMode ? selectedItemRef : null}
                      onMouseDown={(e) => { e.preventDefault(); }}
                      onClick={() => handleRecentSearchClick(item)}
                      onMouseEnter={() => handleMouseEnterRecent(idx)}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left cursor-pointer border-l-4 border-transparent transition-colors duration-0 ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      style={{ cursor: isKeyboardMode ? 'none' : 'pointer' }}
                    >
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-400" />
                      <AutoText text={item} as="span" className="text-gray-700 dark:text-gray-300" />
                    </div>
                  );
                })}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-400 flex justify-between font-english">
            <span>
              <FontAwesomeIcon icon={faArrowUp} className="w-3 h-3 mr-1" />
              <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3 mr-1" />
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