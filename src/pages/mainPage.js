import React from 'react';
import { ResourceList } from '../components/resourceList';
import '../style/MainPage.css';

// Add your components and constants here
const COLORS = ['#bbf7d0', '#99f6e4', '#bfdbfe', '#ddd6fe', '#f5d0fe', '#fed7aa', '#fee2e2'];
const TAGS = ['HTML', 'CSS', 'JavaScript', 'Typescript', 'Tailwind', 'React', 'Next.js', 'Gatsby', 'UI/UX', 'SVG', 'animation', 'webdev', 'Firebase', 'Java', 'Python', 'Resource', 'Google', 'Facebook', 'Tech News', 'AI'];
const DURATION = 12500;
const ROWS = 5;
const TAGS_PER_ROW = 5;

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const shuffle = (arr) => [...arr].sort( () => .5 - Math.random() );

// JS animation
const InfiniteLoopSlider = ({children, duration, reverse = false}) => {
  return (
    <div className='loop-slider' style={{
        '--duration': `${duration}ms`,
        '--direction': reverse ? 'reverse' : 'normal'
      }}>
      <div className='inner'>
        {children}
        {children}
      </div>
    </div>
  );
};

const Tag = ({ text }) => (
  <div className='tag'><span>#</span> {text}</div>
);

export const MainPage = () => {
  return (
    <div className="main-page">
      <header>
        <h1>GleanNet</h1>
        <p>A platform for sharing and checking the best parts of computer science</p>
      </header>
      <div className='tag-list'>
        {[...new Array(ROWS)].map((_, i) => (
          <InfiniteLoopSlider key={i} duration={random(DURATION - 5000, DURATION + 5000)} reverse={i % 2}>
            {shuffle(TAGS).slice(0, TAGS_PER_ROW).map(tag => (
              <Tag text={tag} key={tag}/>
            ))}
          </InfiniteLoopSlider>
        ))}
        <div className='fade'/>
      </div>
      <ResourceList />
    </div>
  );
}

