// src/components/SearchForm.tsx
import React, { useState } from 'react';

interface SearchFormProps {
  onSubmit: (youtubeUrl: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(youtubeUrl);
    setYoutubeUrl(''); // Clear input field after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="youtube-url">Enter YouTube Video URL:</label>
      <input
        
        type="url"
        id="youtube-url"
        name="youtube-url"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        required
      />
      <button type="submit">Find Funny Comments</button>
    </form>
  );
};

export default SearchForm;
