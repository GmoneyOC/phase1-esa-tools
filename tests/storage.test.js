/**
 * localStorage save/load/clear logic tests
 * Tests the serialization patterns used by generator.html
 * Uses a mock localStorage (plain Map-based implementation)
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const STORAGE_KEY = 'phase1-esa-form-data';

// Simple mock localStorage
function createMockStorage() {
    const store = new Map();
    return {
        getItem(key) { return store.has(key) ? store.get(key) : null; },
        setItem(key, val) { store.set(key, String(val)); },
        removeItem(key) { store.delete(key); },
        clear() { store.clear(); }
    };
}

let storage;

beforeEach(() => {
    storage = createMockStorage();
});

// Simulated save function matching generator.html saveToLocalStorage()
function saveToLocalStorage(formData) {
    const data = { version: '1.0', ...formData };
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (_e) {
        return false;
    }
}

// Simulated restore matching generator.html restoreFromLocalStorage()
function restoreFromLocalStorage() {
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
        const data = JSON.parse(saved);
        if (!data.version) return null;
        return data;
    } catch (_e) {
        return null;
    }
}

function clearSavedData() {
    storage.removeItem(STORAGE_KEY);
}

describe('localStorage save', () => {
    it('saves data with version field', () => {
        saveToLocalStorage({ siteName: 'Test Site' });
        const raw = storage.getItem(STORAGE_KEY);
        const data = JSON.parse(raw);
        assert.equal(data.version, '1.0');
        assert.equal(data.siteName, 'Test Site');
    });

    it('saves complex form data', () => {
        const formData = {
            siteName: 'My Site',
            siteAddress: '123 Main St',
            lat: '33.7490',
            lng: '-117.8680',
            recCount: 2,
            siteType: 'commercial'
        };
        saveToLocalStorage(formData);
        const data = restoreFromLocalStorage();
        assert.equal(data.siteName, 'My Site');
        assert.equal(data.recCount, 2);
        assert.equal(data.siteType, 'commercial');
    });

    it('overwrites previous data', () => {
        saveToLocalStorage({ siteName: 'First' });
        saveToLocalStorage({ siteName: 'Second' });
        const data = restoreFromLocalStorage();
        assert.equal(data.siteName, 'Second');
    });
});

describe('localStorage restore', () => {
    it('returns null when no data saved', () => {
        assert.equal(restoreFromLocalStorage(), null);
    });

    it('returns null for corrupt JSON', () => {
        storage.setItem(STORAGE_KEY, '{broken json!!!');
        assert.equal(restoreFromLocalStorage(), null);
    });

    it('returns null for data without version field', () => {
        storage.setItem(STORAGE_KEY, '{"siteName":"test"}');
        assert.equal(restoreFromLocalStorage(), null);
    });

    it('restores valid data correctly', () => {
        const original = { siteName: 'Restored Site', lat: '34.05' };
        saveToLocalStorage(original);
        const restored = restoreFromLocalStorage();
        assert.equal(restored.siteName, 'Restored Site');
        assert.equal(restored.lat, '34.05');
    });
});

describe('localStorage clear', () => {
    it('removes saved data', () => {
        saveToLocalStorage({ siteName: 'Delete Me' });
        clearSavedData();
        assert.equal(restoreFromLocalStorage(), null);
    });
});

describe('localStorage edge cases', () => {
    it('handles empty string values', () => {
        saveToLocalStorage({ siteName: '', lat: '' });
        const data = restoreFromLocalStorage();
        assert.equal(data.siteName, '');
        assert.equal(data.lat, '');
    });

    it('handles special characters', () => {
        saveToLocalStorage({ siteName: "O'Hare & Sons <LLC>" });
        const data = restoreFromLocalStorage();
        assert.equal(data.siteName, "O'Hare & Sons <LLC>");
    });

    it('preserves number types', () => {
        saveToLocalStorage({ recCount: 3 });
        const data = restoreFromLocalStorage();
        assert.equal(typeof data.recCount, 'number');
        assert.equal(data.recCount, 3);
    });
});
