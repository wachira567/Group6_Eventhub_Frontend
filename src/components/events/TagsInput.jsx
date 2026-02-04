import { useState, useRef } from 'react';
import { X, Tag, Plus } from 'lucide-react';

const COMMON_TAGS = [
  // Technology
  'tech', 'conference', 'ai', 'cloud', 'blockchain', 'web3', 'startup', 'innovation',
  // Music & Entertainment
  'music', 'festival', 'concert', 'entertainment', 'dj', 'live', 'performance',
  // Business & Networking
  'networking', 'business', 'entrepreneurship', 'investment', 'startup', 'pitch',
  // Sports & Fitness
  'sports', 'fitness', 'marathon', 'yoga', 'workout', 'competition',
  // Arts & Culture
  'art', 'exhibition', 'culture', 'workshop', 'creative', 'design',
  // Food & Drink
  'food', 'drink', 'culinary', 'wine', 'tasting', 'cooking',
  // Education
  'education', 'workshop', 'training', 'seminar', 'webinar', 'course',
  // Social
  'social', 'community', 'meetup', 'party', 'celebration', 'gathering',
  // Causes
  'charity', 'fundraiser', 'volunteer', 'environment', 'sustainability',
  // Lifestyle
  'wellness', 'health', 'mindfulness', 'meditation', 'self-care'
];

const TagsInput = ({ tags = [], onChange, maxTags = 10 }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const addTag = (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < maxTags) {
      onChange([...tags, normalizedTag]);
    }
    setInputValue('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.trim()) {
      const filtered = COMMON_TAGS.filter(tag => 
        tag.includes(value.toLowerCase()) && !tags.includes(tag)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const getTagColor = (tag) => {
    const colors = [
      'bg-red-100 text-red-700 border-red-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-yellow-100 text-yellow-700 border-yellow-200',
      'bg-lime-100 text-lime-700 border-lime-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-teal-100 text-teal-700 border-teal-200',
      'bg-cyan-100 text-cyan-700 border-cyan-200',
      'bg-sky-100 text-sky-700 border-sky-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-violet-100 text-violet-700 border-violet-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-rose-100 text-rose-700 border-rose-200',
    ];
    // Use hash of tag string to pick consistent color
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(tag)}`}
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#F05537] focus-within:border-[#F05537]">
          <Tag className="w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length < maxTags ? "Add tags (press Enter)" : "Maximum tags reached"}
            disabled={tags.length >= maxTags}
            className="flex-1 outline-none bg-transparent text-sm"
          />
          {inputValue && (
            <button
              onClick={() => addTag(inputValue)}
              className="p-1 bg-[#F05537] text-white rounded hover:bg-[#D94E32] transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm capitalize"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag Count */}
      <p className="text-xs text-gray-500">
        {tags.length}/{maxTags} tags • Press Enter to add
      </p>

      {/* Quick Select Common Tags */}
      {tags.length < maxTags && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
          <div className="flex flex-wrap gap-1">
            {COMMON_TAGS
              .filter(tag => !tags.includes(tag))
              .slice(0, 15)
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors capitalize"
                >
                  + {tag}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsInput;
