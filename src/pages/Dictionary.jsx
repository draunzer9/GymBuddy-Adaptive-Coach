import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { EQUIPMENT_DATA as EQUIPMENT } from '../data/equipment';
import './Dictionary.css';

const CATEGORIES = ['All', 'Machine', 'Free Weight', 'Accessories'];

function Dictionary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    return EQUIPMENT.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="dictionary-container">
      {/* ── Header ──────────────────────── */}
      <div className="dict-header">
        <div>
          <h1 className="dict-title">Equipment Dictionary</h1>
          <p className="dict-subtitle">Identify and choose available workout tools by photo and name</p>
        </div>
      </div>

      {/* ── Search ──────────────────────── */}
      <div className="dict-search-wrap">
        <Search size={17} className="dict-search-icon" />
        <input
          className="dict-search-input"
          type="text"
          placeholder="Search equipment or muscle group..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="dict-clear-btn" onClick={() => setSearchQuery('')}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Category Filters ─────────────── */}
      <div className="dict-filter-row">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`dict-pill ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Equipment Grid ───────────────── */}
      <div className="dict-grid">
        {filtered.length > 0 ? filtered.map(item => (
          <div key={item.id} className="dict-equip-card" style={{ cursor: 'default' }}>
            <div className="dict-equip-img-wrap">
              <img src={item.image} alt={item.name} loading="lazy" />
              <span className={`dict-equip-cat-badge cat-${item.category.replace(' ', '-').toLowerCase()}`}>
                {item.category}
              </span>
            </div>
            <div className="dict-equip-body" style={{ paddingBottom: '14px' }}>
              <h3 className="dict-equip-name">{item.name}</h3>
              <p className="dict-equip-muscles">{item.muscles.slice(0, 3).join(' · ')}</p>
            </div>
          </div>
        )) : (
          <div className="dict-empty" style={{ gridColumn: '1 / -1' }}>
            <Search size={40} color="rgba(255,255,255,0.08)" />
            <p>No equipment found</p>
            <span>Try a different category or keyword</span>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

export default Dictionary;
