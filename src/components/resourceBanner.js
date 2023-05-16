import React from 'react';
import { Link } from 'react-router-dom';
import '../style/ResourceBanner.css';

export const ResourceBanner = ({ resource }) => {
  return (
    <div className="resource-banner">
      <img className="resource-banner-logo" src={resource.logoURL} alt={resource.name} />
      <div className="resource-banner-details">
        <h2 className="resource-banner-name">{resource.name}</h2>
        <p className="resource-banner-desc">{resource.desc}</p>
        <p className="resource-banner-info">Upvotes: {resource.upvote}</p>
        <p className="resource-banner-info">Type: {resource.type}</p>
        <p className="resource-banner-info">Author: {resource.publisher}</p>
        <Link to={`/resources/${resource.id}`} className="resource-banner-link">View Details</Link>
      </div>
    </div>
  );
}
