import React from 'react';
import { CreateResource } from '../components/createResource';
import "../style/CreateResourcePage.css"

export const CreateResourcePage = () => {
  return (
    <div className='create-resource-page'>
      <h1> Create Resource Page </h1>
      <CreateResource />
    </div>
  );
}