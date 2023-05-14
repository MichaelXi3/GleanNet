import React from 'react';
import { ResourceList } from '../components/resourceList';
import '../style/MainPage.css';

export const MainPage = () => {
  return (
    <div className="main-page">
      <h1> Share Platform </h1>
      <ResourceList />
    </div>
  );
}
