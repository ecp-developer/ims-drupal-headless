import React, { useState } from 'react';
import sqlReferenceService from '../services/sqlReferenceService';
import './SQLDataSync.css';

const SQLDataSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSyncAll = async () => {
    setSyncing(true);
    setResults(null);
    
    try {
      const syncResults = await sqlReferenceService.syncAllReferences();
      setResults(syncResults);
      alert('Sync completed! Check the results below.');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncOffices = async () => {
    setSyncing(true);
    try {
      const result = await sqlReferenceService.syncOfficesToDrupal();
      setResults({ offices: result });
      alert(result.message);
    } catch (error) {
      alert('Failed to sync offices');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncWings = async () => {
    setSyncing(true);
    try {
      const result = await sqlReferenceService.syncWingsToDrupal();
      setResults({ wings: result });
      alert(result.message);
    } catch (error) {
      alert('Failed to sync wings');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncDecs = async () => {
    setSyncing(true);
    try {
      const result = await sqlReferenceService.syncDecsToDrupal();
      setResults({ decs: result });
      alert(result.message);
    } catch (error) {
      alert('Failed to sync DECs');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="sql-data-sync">
      <div className="sync-header">
        <h2>🔄 SQL to Drupal Data Sync</h2>
        <p>Sync reference data from SQL Server to Drupal taxonomies</p>
      </div>

      <div className="sync-cards">
        <div className="sync-card">
          <div className="card-icon">🏢</div>
          <h3>Offices</h3>
          <p>Sync office data from SQL Server to Drupal taxonomy</p>
          <button 
            className="btn-sync" 
            onClick={handleSyncOffices}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Offices'}
          </button>
        </div>

        <div className="sync-card">
          <div className="card-icon">🪽</div>
          <h3>Wings</h3>
          <p>Sync wing data from SQL Server to Drupal taxonomy</p>
          <button 
            className="btn-sync" 
            onClick={handleSyncWings}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Wings'}
          </button>
        </div>

        <div className="sync-card">
          <div className="card-icon">🗳️</div>
          <h3>DECs</h3>
          <p>Sync DEC data from SQL Server to Drupal taxonomy</p>
          <button 
            className="btn-sync" 
            onClick={handleSyncDecs}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync DECs'}
          </button>
        </div>
      </div>

      <div className="sync-all-section">
        <button 
          className="btn-sync-all" 
          onClick={handleSyncAll}
          disabled={syncing}
        >
          {syncing ? '⏳ Syncing All...' : '🔄 Sync All Data'}
        </button>
      </div>

      {results && (
        <div className="sync-results">
          <h3>Sync Results:</h3>
          {results.offices && (
            <div className={`result-item ${results.offices.success ? 'success' : 'error'}`}>
              <strong>Offices:</strong> {results.offices.message} ({results.offices.synced} synced)
            </div>
          )}
          {results.wings && (
            <div className={`result-item ${results.wings.success ? 'success' : 'error'}`}>
              <strong>Wings:</strong> {results.wings.message} ({results.wings.synced} synced)
            </div>
          )}
          {results.decs && (
            <div className={`result-item ${results.decs.success ? 'success' : 'error'}`}>
              <strong>DECs:</strong> {results.decs.message} ({results.decs.synced} synced)
            </div>
          )}
        </div>
      )}

      <div className="sync-info">
        <h4>📋 How it works:</h4>
        <ol>
          <li>Creates taxonomies in Drupal (offices, wings, decs)</li>
          <li>Fetches data from SQL Server tables</li>
          <li>Syncs to Drupal as taxonomy terms</li>
          <li>You can then use these as entity references in content types</li>
        </ol>
      </div>
    </div>
  );
};

export default SQLDataSync;
