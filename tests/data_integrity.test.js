/**
 * Data integrity tests
 * Validates the data source arrays in generator.html and dashboard.html
 * Parses inline JS to extract data, then checks structure and consistency
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let federalDbs, stateDbs, dashboardData;

before(() => {
    const root = resolve(__dirname, '..');
    const generatorHTML = readFileSync(resolve(root, 'public/generator.html'), 'utf-8');
    const dashboardHTML = readFileSync(resolve(root, 'public/dashboard.html'), 'utf-8');

    // Extract FEDERAL_DBS array from generator.html
    const fedMatch = generatorHTML.match(/const FEDERAL_DBS = \[([\s\S]*?)\];/);
    assert.ok(fedMatch, 'FEDERAL_DBS array not found in generator.html');
    federalDbs = (new Function('return [' + fedMatch[1] + ']'))();

    // Extract STATE_DBS array from generator.html
    const stMatch = generatorHTML.match(/const STATE_DBS = \[([\s\S]*?)\];/);
    assert.ok(stMatch, 'STATE_DBS array not found in generator.html');
    stateDbs = (new Function('return [' + stMatch[1] + ']'))();

    // Extract DATA array from dashboard.html
    const dataMatch = dashboardHTML.match(/const DATA = \[([\s\S]*?)\];\s*\n/);
    assert.ok(dataMatch, 'DATA array not found in dashboard.html');
    dashboardData = (new Function('return [' + dataMatch[1] + ']'))();
});

describe('Generator — FEDERAL_DBS', () => {
    it('has 15 federal sources', () => {
        assert.equal(federalDbs.length, 15);
    });

    it('each entry has required fields with correct types', () => {
        for (const db of federalDbs) {
            assert.equal(typeof db.name, 'string', `name missing or wrong type for ${JSON.stringify(db)}`);
            assert.equal(typeof db.url, 'string', `url missing for ${db.name}`);
            assert.equal(typeof db.desc, 'string', `desc missing for ${db.name}`);
            assert.equal(typeof db.api, 'boolean', `api must be boolean for ${db.name}`);
            assert.equal(typeof db.gis, 'boolean', `gis must be boolean for ${db.name}`);
        }
    });

    it('all URLs start with https://', () => {
        for (const db of federalDbs) {
            assert.match(db.url, /^https:\/\//, `${db.name} URL does not start with https://`);
        }
    });

    it('no duplicate names', () => {
        const names = federalDbs.map(d => d.name);
        assert.equal(new Set(names).size, names.length, 'Duplicate names found');
    });

    it('no duplicate URLs', () => {
        const urls = federalDbs.map(d => d.url);
        assert.equal(new Set(urls).size, urls.length, 'Duplicate URLs found');
    });
});

describe('Generator — STATE_DBS', () => {
    it('has 13 state sources', () => {
        assert.equal(stateDbs.length, 13);
    });

    it('each entry has required fields with boolean types', () => {
        for (const db of stateDbs) {
            assert.equal(typeof db.name, 'string');
            assert.equal(typeof db.url, 'string');
            assert.equal(typeof db.desc, 'string');
            assert.equal(typeof db.api, 'boolean', `api must be boolean for ${db.name}`);
            assert.equal(typeof db.gis, 'boolean', `gis must be boolean for ${db.name}`);
        }
    });

    it('all URLs start with https://', () => {
        for (const db of stateDbs) {
            assert.match(db.url, /^https:\/\//, `${db.name} URL does not start with https://`);
        }
    });

    it('includes essential California databases', () => {
        const names = stateDbs.map(d => d.name);
        assert.ok(names.includes('GeoTracker'), 'Missing GeoTracker');
        assert.ok(names.includes('EnviroStor'), 'Missing EnviroStor');
        assert.ok(names.includes('GAMA'), 'Missing GAMA');
    });
});

describe('Dashboard — DATA array', () => {
    it('has 29 data sources', () => {
        assert.equal(dashboardData.length, 29);
    });

    it('each entry has required dashboard fields', () => {
        for (const d of dashboardData) {
            assert.ok(d.name, `missing name`);
            assert.ok(d.url, `missing url for ${d.name}`);
            assert.ok(d.agency, `missing agency for ${d.name}`);
            assert.ok(d.category, `missing category for ${d.name}`);
            assert.ok(d.dataType, `missing dataType for ${d.name}`);
            assert.ok(d.hasAPI !== undefined, `missing hasAPI for ${d.name}`);
            assert.ok(d.hasGIS !== undefined, `missing hasGIS for ${d.name}`);
            assert.ok(d.description, `missing description for ${d.name}`);
        }
    });

    it('hasAPI and hasGIS use string "Yes"/"No" values', () => {
        for (const d of dashboardData) {
            assert.ok(["Yes", "No"].includes(d.hasAPI), `${d.name} hasAPI is "${d.hasAPI}", expected "Yes" or "No"`);
            assert.ok(["Yes", "No"].includes(d.hasGIS), `${d.name} hasGIS is "${d.hasGIS}", expected "Yes" or "No"`);
        }
    });

    it('categories are valid enum values', () => {
        const validCategories = ['Federal', 'California State', 'Geologic-Hydro'];
        for (const d of dashboardData) {
            assert.ok(validCategories.includes(d.category), `${d.name} has invalid category "${d.category}"`);
        }
    });

    it('no duplicate names', () => {
        const names = dashboardData.map(d => d.name);
        assert.equal(new Set(names).size, names.length, 'Duplicate names found');
    });

    it('all URLs start with https://', () => {
        for (const d of dashboardData) {
            assert.match(d.url, /^https:\/\//, `${d.name} URL does not start with https://`);
        }
    });
});

describe('Cross-file data consistency', () => {
    // Names differ between files: generator uses short names (e.g. "USGS NWIS"),
    // dashboard uses long names (e.g. "USGS National Water Information System (NWIS)")
    // Match by URL instead of name since URLs are consistent

    it('all generator federal source URLs appear in dashboard', () => {
        const dashUrls = dashboardData.map(d => d.url);
        for (const db of federalDbs) {
            assert.ok(dashUrls.includes(db.url), `Federal source "${db.name}" URL (${db.url}) missing from dashboard`);
        }
    });

    it('all generator state source URLs appear in dashboard', () => {
        const dashUrls = dashboardData.map(d => d.url);
        for (const db of stateDbs) {
            assert.ok(dashUrls.includes(db.url), `State source "${db.name}" URL (${db.url}) missing from dashboard`);
        }
    });

    it('API boolean values match between files (matched by URL)', () => {
        for (const db of [...federalDbs, ...stateDbs]) {
            const dashEntry = dashboardData.find(d => d.url === db.url);
            if (dashEntry) {
                const expectedBool = dashEntry.hasAPI === "Yes";
                assert.equal(db.api, expectedBool, `API mismatch for "${db.name}": generator=${db.api}, dashboard=${dashEntry.hasAPI}`);
            }
        }
    });

    it('GIS boolean values match between files (matched by URL)', () => {
        for (const db of [...federalDbs, ...stateDbs]) {
            const dashEntry = dashboardData.find(d => d.url === db.url);
            if (dashEntry) {
                const expectedBool = dashEntry.hasGIS === "Yes";
                assert.equal(db.gis, expectedBool, `GIS mismatch for "${db.name}": generator=${db.gis}, dashboard=${dashEntry.hasGIS}`);
            }
        }
    });

    it('generator source count + extras equals dashboard count', () => {
        const genCount = federalDbs.length + stateDbs.length;
        const genUrls = [...federalDbs, ...stateDbs].map(d => d.url);
        const dashUrls = dashboardData.map(d => d.url);
        const extras = dashUrls.filter(u => !genUrls.includes(u));
        // Dashboard may have additional sources not in generator (e.g. Stanford)
        assert.equal(dashboardData.length, genCount + extras.length,
            `Dashboard has ${dashboardData.length} sources, generator has ${genCount}, extras: ${extras.length}`);
        // At minimum, dashboard should have at least as many as generator
        assert.ok(dashboardData.length >= genCount, 'Dashboard should have at least as many sources as generator');
    });
});
