import React from 'react';
import { UpdateResource } from '../components/updateResource';
import "../style/CreateResourcePage.css"

export const UpdateResourcePage = () => {
  return (
    <div className='create-resource-page'>
      <h1> Update Resource Page </h1>
      <UpdateResource />
    </div>
  );
}