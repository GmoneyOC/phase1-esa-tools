/**
 * Validation rules unit tests
 * Tests the validation logic used in generator.html
 * Rules are extracted here to match the inline validators object
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Extract validator test functions (mirroring generator.html validators object)
const validators = {
    lat: {
        test: v => v === "" || (/^-?\d+\.?\d*$/.test(v) && parseFloat(v) >= -90 && parseFloat(v) <= 90),
        msg: "Latitude must be a number between -90 and 90"
    },
    lng: {
        test: v => v === "" || (/^-?\d+\.?\d*$/.test(v) && parseFloat(v) >= -180 && parseFloat(v) <= 180),
        msg: "Longitude must be a number between -180 and 180"
    },
    acreage: {
        test: v => v === "" || (/^\d+\.?\d*$/.test(v) && parseFloat(v) > 0),
        msg: "Acreage must be a positive number"
    },
    apn: {
        test: v => v === "" || /^\d{3}-\d{3}-\d{3}$/.test(v),
        msg: "APN format: 000-000-000"
    },
    reportDate: {
        test: v => v === "" || new Date(v) <= new Date(),
        msg: "Report date cannot be in the future"
    },
    gwDepth: {
        test: v => v === "" || (/^\d+\.?\d*$/.test(v) && parseFloat(v) >= 0),
        msg: "Depth to groundwater must be a non-negative number"
    },
    precip: {
        test: v => v === "" || (/^\d+\.?\d*$/.test(v) && parseFloat(v) >= 0),
        msg: "Precipitation must be a non-negative number"
    },
    elevation: {
        test: v => v === "" || /^-?\d+\.?\d*$/.test(v),
        msg: "Elevation must be a number"
    }
};

describe('Latitude validation', () => {
    const test = validators.lat.test;

    it('accepts empty string (optional field)', () => {
        assert.equal(test(""), true);
    });

    it('accepts valid latitude at equator', () => {
        assert.equal(test("0"), true);
    });

    it('accepts valid latitude for California', () => {
        assert.equal(test("33.7490"), true);
        assert.equal(test("37.7749"), true);
    });

    it('accepts boundary values', () => {
        assert.equal(test("90"), true);
        assert.equal(test("-90"), true);
    });

    it('rejects latitude out of range', () => {
        assert.equal(test("91"), false);
        assert.equal(test("-91"), false);
        assert.equal(test("180"), false);
    });

    it('rejects non-numeric input', () => {
        assert.equal(test("abc"), false);
        assert.equal(test("33.77N"), false);
    });
});

describe('Longitude validation', () => {
    const test = validators.lng.test;

    it('accepts empty string', () => {
        assert.equal(test(""), true);
    });

    it('accepts valid longitude for California', () => {
        assert.equal(test("-122.4194"), true);
        assert.equal(test("-117.1611"), true);
    });

    it('accepts boundary values', () => {
        assert.equal(test("180"), true);
        assert.equal(test("-180"), true);
    });

    it('rejects longitude out of range', () => {
        assert.equal(test("181"), false);
        assert.equal(test("-181"), false);
    });

    it('rejects non-numeric input', () => {
        assert.equal(test("west"), false);
    });
});

describe('Acreage validation', () => {
    const test = validators.acreage.test;

    it('accepts empty string', () => {
        assert.equal(test(""), true);
    });

    it('accepts positive numbers', () => {
        assert.equal(test("1"), true);
        assert.equal(test("0.5"), true);
        assert.equal(test("100.25"), true);
    });

    it('rejects zero', () => {
        assert.equal(test("0"), false);
    });

    it('rejects negative numbers', () => {
        assert.equal(test("-5"), false);
    });

    it('rejects non-numeric input', () => {
        assert.equal(test("large"), false);
    });
});

describe('APN validation', () => {
    const test = validators.apn.test;

    it('accepts empty string', () => {
        assert.equal(test(""), true);
    });

    it('accepts valid APN format 000-000-000', () => {
        assert.equal(test("123-456-789"), true);
        assert.equal(test("000-000-000"), true);
    });

    it('rejects wrong format', () => {
        assert.equal(test("12-345-678"), false);
        assert.equal(test("1234-567-890"), false);
        assert.equal(test("123456789"), false);
        assert.equal(test("ABC-DEF-GHI"), false);
    });
});

describe('Report date validation', () => {
    const test = validators.reportDate.test;

    it('accepts empty string', () => {
        assert.equal(test(""), true);
    });

    it('accepts past dates', () => {
        assert.equal(test("2024-01-01"), true);
        assert.equal(test("2025-06-15"), true);
    });

    it('accepts today', () => {
        const today = new Date().toISOString().split('T')[0];
        assert.equal(test(today), true);
    });

    it('rejects future dates', () => {
        assert.equal(test("2099-12-31"), false);
    });
});

describe('Groundwater depth validation', () => {
    const test = validators.gwDepth.test;

    it('accepts empty string', () => {
        assert.equal(test(""), true);
    });

    it('accepts zero (surface water)', () => {
        assert.equal(test("0"), true);
    });

    it('accepts positive depth values', () => {
        assert.equal(test("15"), true);
        assert.equal(test("150.5"), true);
    });

    it('rejects negative depth', () => {
        assert.equal(test("-10"), false);
    });
});

describe('Precipitation validation', () => {
    const test = validators.precip.test;

    it('accepts empty string', () => {
        assert.equal(test(""), true);
    });

    it('accepts zero', () => {
        assert.equal(test("0"), true);
    });

    it('accepts positive values', () => {
        assert.equal(test("12.5"), true);
    });

    it('rejects negative values', () => {
        assert.equal(test("-1"), false);
    });
});

describe('Elevation validation', () => {
    const test = validators.elevation.test;

    it('accepts empty string', () => {
        assert.equal(test(""), true);
    });

    it('accepts positive elevation', () => {
        assert.equal(test("500"), true);
    });

    it('accepts negative elevation (below sea level)', () => {
        assert.equal(test("-86"), true);
    });

    it('accepts decimal values', () => {
        assert.equal(test("123.45"), true);
    });

    it('rejects non-numeric', () => {
        assert.equal(test("high"), false);
    });
});
