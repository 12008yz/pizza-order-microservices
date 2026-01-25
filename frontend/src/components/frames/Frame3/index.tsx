'use client';

import { useState } from 'react';
import TariffsList from './TariffsList';
import FilterModal from './FilterModal';
import TechAccessModal from './TechAccessModal';
import NotificationBanner from './NotificationBanner';
import SortingOptions from './SortingOptions';

export default function Frame3() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTechAccessModal, setShowTechAccessModal] = useState(false);

  return (
    <div className="relative w-[400px] h-[870px] bg-white">
      {/* Notification Banner */}
      <NotificationBanner />

      {/* Sorting Options */}
      <SortingOptions />

      {/* Tariffs List */}
      <TariffsList />

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Tech Access Modal */}
      {showTechAccessModal && (
        <TechAccessModal
          isOpen={showTechAccessModal}
          onClose={() => setShowTechAccessModal(false)}
        />
      )}
    </div>
  );
}
