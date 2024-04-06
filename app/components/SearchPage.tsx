
'use client'

import React, { useState, useEffect } from 'react';
import SearchForm from './SearchForm';
import {marked} from 'marked';

const YOUTUBE_API_KEY = 'AIzaSyB-c36wi20pPY5TB-i-GhTtNCzC1VWw5Ng'
const MODEL_NAME = "gemini-1.0-pro"

type FunnyComment = string;

const SearchPage: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  // const [comments, setComments] = useState<FunnyComment[]>([]);
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const youtubeComments = await fetchYoutubeComments(url);
      console.log(youtubeComments,'youtubeComments')

      const funnyComments = await sendForFunninessAnalysis(youtubeComments);


      // setComments(Array.isArray(funnyComments) ? funnyComments : [funnyComments]);
      //setComments(Array.isArray(funnyComments) ? funnyComments.filter(comment => comment !== undefined) : []);
      setComments(funnyComments || ''); // Set empty string if funnyComments is undefined // Get top 10
    } catch (error) {
      setError('Failed to find funny comments.');
    } finally {
      setIsLoading(false);
    }
  };

  // const sendForFunninessAnalysis = async (comments: any) => {
  //   const genAI = new GoogleGenerativeAI(YOUTUBE_API_KEY);
  //   const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  //   const generationConfig = {
  //     temperature: 0.9,
  //     topK: 1,
  //     topP: 1,
  //     maxOutputTokens: 2048,
  //   };
  //   const safetySettings = [
  //     {
  //       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
  //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  //     },
  //     {
  //       category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  //     },
  //     {
  //       category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  //     },
  //     {
  //       category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  //     },
  //   ];

  //   const chat = model.startChat({
  //     generationConfig,
  //     safetySettings,
  //     history: [
  //       {
  //         role: "user",
  //         parts: [{ text: "i will give you an array of comment, help me pick the most funny one"}],
  //       },
  //       {
  //         role: "model",
  //         parts: [{ text: "Sounds like fun! I'm ready to put my humor detection skills to the test. Just feed me the array of comments, and I'll do my best to pick the one that tickles my funny bone the most. \n\nRemember, humor can be subjective, so what I find funny might not be the same for everyone.  But I'll try my best to pick the one with the most comedic potential."}],
  //       },
  //       {
  //         role: "user",
  //         parts: [{ text: JSON.stringify(comments) }],
  //       },
  //     ],
  //   });

  //     //PREPARE commemts to gemini API
  //     const gemini_data = comments.map((com: string) => ({
  //       comment: com
  //     }));
  
  //   const result = await chat.sendMessage(gemini_data);
  //   const response = result.response;

  //   const gemini_result = response.text();
  //   console.log(gemini_result);
  
  
  //   // console.log(comments,'comments', gemini_data)
  //   return gemini_result; 
  // };

  const sendForFunninessAnalysis = async (comments: any) => {
    console.log(comments,'comments from youtube')

    const gemini_data = comments.map((com: string) => ({
        comment: com
    }));


    const conversation = [
      {
        role: "user",
        parts: [{ text: "i will give you an array of comment, help me pick the most funny one" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Sounds like fun! I'm ready to put my humor detection skills to the test. Just feed me the array of comments, and I'll do my best to pick the one that tickles my funny bone the most. \n\nRemember, humor can be subjective, so what I find funny might not be the same for everyone.  But I'll try my best to pick the one with the most comedic potential.",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: JSON.stringify([
              // ... your comments here (replace with the actual comments array)
              { comment: "고마워요 페기 구" },
              // ... other comments
            ]),
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "## Analyzing the Humor Potential:\n\n... (analysis result) ...\n\n## The Verdict:\n\n... (funniest comment) ...",
          },
        ],
      },
    ];
  
    const userInput = `Tell me the top 3 funnies comment from the following array. Each comment is an object with strucutre {comment: }. I want your result to be only the comments. And in the end tell me why you think they are funny.: ${JSON.stringify(gemini_data)}`;

    const data = {
      contents: conversation.concat({
        role: "user",
        parts: [{ text: userInput }], // Add user input if provided
      }),
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        stopSequences: [],
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    console.log(data,'data')
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${YOUTUBE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    
    try {
      if (response.ok) {
        const responseData = await response.json();
        const geminiAnswer = responseData.candidates[0].content.parts[0].text;
        console.log(responseData, 'response gemini');

        const HTMLanswer = marked(geminiAnswer);
        console.log(HTMLanswer,'HTMLanswer')

        return HTMLanswer;
        // Process the response data as needed
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle errors appropriately
    }
    }
  

  const fetchYoutubeComments = async (url: string) => {
    // Implement logic to fetch comments from YouTube Data API v3
    // using your API key and video ID extracted from the URL
    const videoId = new URL(url).searchParams.get('v'); // Assuming URL format
    const response = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`);

    if (!response.ok) {
      console.log(`Error fetching comments: ${response.statusText}, url is ${YOUTUBE_API_KEY}`);
    }

    const data = await response.json();
    return data.items.map((item: any) => (item.snippet.topLevelComment.snippet.textDisplay));
  };

  return (
    <div>
      <SearchForm onSubmit={handleSubmit} />
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {comments && <div dangerouslySetInnerHTML={{ __html: comments }}></div>}
      {/* {comments.map((comment, index) => (
        <div>
        <p key={index}>{comment}</p> 
        <br></br>
        </div>
      ))} */}
    </div>
  );
};

export default SearchPage;
