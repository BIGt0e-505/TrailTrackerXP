/**
 * GPX Activity Identity — stable duplicate detection across files
 *
 * Used by export (skip existing files in target folder) and import
 * (skip activities already saved internally) to prevent duplicates.
 *
 * Identity is layered:
 *   1. Strong: TrailTrackerXP activity id embedded in GPX <desc> tag
 *   2. Route:  start timestamp ±5s, duration ±5s, distance ±10m, route hash
 *   3. Fallback: start timestamp, distance, duration, type, point count
 *
 * Route hash: round lat/lon to 5 decimal places (~1m), hash first+middle+last
 * points plus total point count. Stable across re-exports and re-imports.
 */

/**
 * Build a signature object from parsed GPX route data + metadata.
 * @param {Object} params - { routeData, timestamp, distance, duration, type, id? }
 * @returns {Object} signature
 */
export const buildSignature = ({ routeData = [], timestamp = null, distance = null, duration = null, type = null, id = null }) => {
  const pointCount = routeData.length;

  // Extract start/end times
  const startTime = routeData.length > 0 ? routeData[0].timestamp : (timestamp ? new Date(timestamp).getTime() : null);
  const endTime = routeData.length > 0 ? routeData[routeData.length - 1].timestamp : null;

  // Route hash: round coords to 5 decimal places, hash first/middle/last + count
  const routeHash = computeRouteHash(routeData);

  // Rounded values for fuzzy matching
  const startTimeRounded = startTime ? Math.round(startTime / 1000) : null; // seconds epoch
  const durationRounded = duration != null ? Math.round(duration) : (startTime && endTime ? Math.round((endTime - startTime) / 1000) : null);
  const distanceRounded = distance != null ? Math.round(distance * 1000) : (routeData.length > 0 ? Math.round((routeData[routeData.length - 1].cumulativeDistance || 0) * 1000) : null); // metres

  return {
    id: id || null,
    startTime: startTimeRounded,
    duration: durationRounded,
    distance: distanceRounded, // metres
    type: type || null,
    pointCount,
    routeHash,
  };
};

/**
 * Compute a stable hash from route data.
 * Uses first, middle, and last points rounded to 5 decimal places plus point count.
 * This is stable across re-exports/re-imports while being distinctive enough
 * to avoid false matches between different activities.
 */
const computeRouteHash = (routeData) => {
  if (!routeData || routeData.length === 0) return null;

  const round5 = (v) => Math.round(v * 100000) / 100000;

  const first = routeData[0];
  const last = routeData[routeData.length - 1];
  const midIdx = Math.floor(routeData.length / 2);
  const mid = routeData[midIdx];

  const key = [
    routeData.length,
    `${round5(first.latitude)},${round5(first.longitude)}`,
    `${round5(mid.latitude)},${round5(mid.longitude)}`,
    `${round5(last.latitude)},${round5(last.longitude)}`,
  ].join('|');

  // Simple hash (djb2-like) — stable and sufficient for dedup
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) + key.charCodeAt(i);
    hash = hash & 0xFFFFFFFF; // Keep it 32-bit
  }
  return (hash >>> 0).toString(16);
};

/**
 * Compare two signatures and return whether they represent the same activity.
 * Layered matching: id → route hash → fallback.
 *
 * @param {Object} a - signature
 * @param {Object} b - signature
 * @returns {boolean} true if duplicate
 */
export const isDuplicate = (a, b) => {
  if (!a || !b) return false;

  // Layer 1: Strong — same TrailTrackerXP id
  if (a.id && b.id && a.id === b.id) return true;

  // Layer 2: Route — start time ±5s, duration ±5s, distance ±10m, same route hash
  if (a.routeHash && b.routeHash && a.routeHash === b.routeHash) {
    return true;
  }

  // Layer 3: Fallback — start time, distance, duration, type
  if (a.startTime && b.startTime) {
    const startDiff = Math.abs(a.startTime - b.startTime);
    if (startDiff <= 5) {
      const distDiff = a.distance != null && b.distance != null ? Math.abs(a.distance - b.distance) : Infinity;
      const durDiff = a.duration != null && b.duration != null ? Math.abs(a.duration - b.duration) : Infinity;
      const typeMatch = !a.type || !b.type || a.type === b.type;
      const pointDiff = a.pointCount != null && b.pointCount != null ? Math.abs(a.pointCount - b.pointCount) : Infinity;

      // Distance within 10m or 1%, duration within 5s, type matches (if known)
      const distOk = distDiff <= 10 || (a.distance && b.distance && distDiff / Math.max(a.distance, b.distance) <= 0.01);
      const durOk = durDiff <= 5;
      const pointOk = pointDiff <= Math.max(5, Math.round(a.pointCount * 0.05)); // 5% tolerance

      if (distOk && durOk && typeMatch && pointOk) return true;
    }
  }

  return false;
};

/**
 * Normalise a GPX filename for duplicate detection.
 * Strips copy suffixes like (1), - Copy, copy, _duplicate etc.
 * Returns the normalised basename (lowercase, no .gpx extension).
 */
export const normaliseDuplicateFilename = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\.gpx\s*\(\d+\)\s*$/i, '.gpx')   // activity.gpx (1) → activity.gpx
    .replace(/\.gpx\s*-\s*copy\s*$/i, '.gpx')    // activity.gpx - copy → activity.gpx
    .replace(/\.gpx\s+copy\s*$/i, '.gpx')        // activity.gpx copy → activity.gpx
    .replace(/\.gpx\s*-\s*duplicate\s*$/i, '.gpx') // activity.gpx - duplicate → activity.gpx
    .replace(/\.gpx\s+duplicate\s*$/i, '.gpx')   // activity.gpx duplicate → activity.gpx
    .replace(/\.gpx_copy\s*$/i, '.gpx')           // activity.gpx_copy → activity.gpx
    .replace(/\.gpx_duplicate\s*$/i, '.gpx')     // activity.gpx_duplicate → activity.gpx
    .replace(/\.gpx\s*\(\d+\)\s*/ig, '.gpx')    // any remaining .gpx (N) mid-string
    .replace(/\(\d+\)/g, '')                     // any remaining (N) patterns
    .replace(/\s+/g, ' ')                         // normalise whitespace
    .trim();
};

/**
 * Simple string hash for content comparison.
 * Not cryptographic — just a fast stable hash for detecting identical file content.
 */
export const simpleHash = (str) => {
  if (!str) return null;
  let hash = 0;
  // Sample the string to avoid hashing multi-MB files character by character
  const len = str.length;
  const step = Math.max(1, Math.floor(len / 10000)); // sample ~10k chars max
  for (let i = 0; i < len; i += step) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & 0xFFFFFFFF;
  }
  // Also include length in the hash so different-length files don't collide
  return `${len}-${(hash >>> 0).toString(16)}`;
};

/**
 * Build signature from a GPX file content string (parsed).
 * Convenience wrapper for use during import/export scanning.
 *
 * @param {string} gpxContent - raw GPX file content
 * @returns {Object} signature (or null if no route data)
 */
export const signatureFromGPXContent = (gpxContent) => {
  // Lightweight parse — extract only what we need for signature
  const routeData = [];

  // Extract id from <desc> tag if present (TrailTrackerXP format)
  let id = null;
  const descMatch = gpxContent.match(/<desc>([^<]*TrailTrackerXP activity id:\s*([^<]+))<\/desc>/i);
  if (descMatch) {
    id = descMatch[2].trim();
  }

  // Extract type
  const typeMatch = gpxContent.match(/<type>([^<]+)<\/type>/);
  const gpxType = typeMatch ? typeMatch[1] : null;

  // Extract metadata time
  const metaTimeMatch = gpxContent.match(/<metadata>\s*<time>([^<]+)<\/time>/);
  const metadataTime = metaTimeMatch ? metaTimeMatch[1] : null;

  // Extract track points
  const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>\s*(?:<ele>([^<]*)<\/ele>)?\s*(?:<time>([^<]*)<\/time>)?/g;
  let match;
  while ((match = trkptRegex.exec(gpxContent)) !== null) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const time = match[4] ? new Date(match[4]).getTime() : Date.now();
    routeData.push({ latitude: lat, longitude: lon, timestamp: time });
  }

  if (routeData.length === 0) return null;

  const startTime = routeData[0].timestamp;
  const endTime = routeData[routeData.length - 1].timestamp;
  const duration = (endTime - startTime) / 1000;

  return buildSignature({
    routeData,
    timestamp: metadataTime,
    duration,
    type: gpxType,
    id,
  });
};

/**
 * Extract TrailTrackerXP activity id from GPX content.
 * @param {string} gpxContent
 * @returns {string|null}
 */
export const extractActivityId = (gpxContent) => {
  const descMatch = gpxContent.match(/<desc>TrailTrackerXP activity id:\s*([^<]+)<\/desc>/i);
  return descMatch ? descMatch[1].trim() : null;
};

/**
 * Determine whether a filename looks like a TrailTrackerXP export.
 * TrailTrackerXP files start with "TrailTracker_" or contain TrailTrackerXP metadata.
 */
const isTrailTrackerFile = (fileName, gpxContent) => {
  if (fileName && /^TrailTracker[_]/i.test(fileName)) return true;
  if (gpxContent && /creator="TrailTrackerXP"/.test(gpxContent)) return true;
  return false;
};

/**
 * Determine whether a filename looks like a duplicate/copy file.
 * Matches patterns like "file (1).gpx", "file copy.gpx", "file_duplicate.gpx".
 */
const isCopyFilename = (fileName) => {
  if (!fileName) return false;
  return /\((\d+)\)\s*\.gpx$/i.test(fileName)
    || /\bcopy\b/i.test(fileName)
    || /\bduplicate\b/i.test(fileName)
    || /\bcopia\b/i.test(fileName);
};

/**
 * Pick the canonical file from a group of duplicates.
 * Preference order:
 *   1. Non-TrailTrackerXP file (Strava original) over TrailTrackerXP export
 *   2. Non-copy filename over copy-style filename
 *   3. Shortest filename (cleanest)
 *   4. Alphabetically first
 *
 * @param {Array} files - [{ uri, name, content, signature }]
 * @returns {Object} canonical file
 */
export const pickCanonical = (files) => {
  if (files.length === 1) return files[0];

  const scored = files.map(f => {
    let score = 0;
    const isTTP = isTrailTrackerFile(f.name, f.content);
    const isCopy = isCopyFilename(f.name);

    // Prefer non-TrailTracker files (originals)
    if (!isTTP) score -= 100;
    // Prefer non-copy filenames
    if (!isCopy) score -= 50;
    // Prefer shorter filenames
    score += f.name ? f.name.length : 999;
    // Prefer files without "TrailTracker" in the name
    if (f.name && /TrailTracker/i.test(f.name)) score += 10;

    return { file: f, score };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored[0].file;
};

/**
 * Group an array of GPX files by duplicate identity.
 * Returns groups with canonical selection and confidence level.
 *
 * @param {Array} files - [{ uri, name, content }] (content is raw GPX string)
 * @returns {Object} { groups: [{ canonical, duplicates, confidence, signature }], unique: [], unparseable: [] }
 */
export const groupDuplicates = (files) => {
  const parsed = [];
  const unparseable = [];

  for (const f of files) {
    const sig = signatureFromGPXContent(f.content || '');
    if (sig) {
      parsed.push({ ...f, signature: sig });
    } else {
      unparseable.push(f);
    }
  }

  // Group by identity match
  const groups = [];
  const assigned = new Array(parsed.length).fill(false);

  for (let i = 0; i < parsed.length; i++) {
    if (assigned[i]) continue;

    const group = [parsed[i]];
    assigned[i] = true;

    // Determine confidence for this group's primary match
    let confidence = 'id'; // highest confidence

    for (let j = i + 1; j < parsed.length; j++) {
      if (assigned[j]) continue;

      if (isDuplicate(parsed[i].signature, parsed[j].signature)) {
        // Determine confidence level for this match
        if (parsed[i].signature.id && parsed[j].signature.id &&
            parsed[i].signature.id === parsed[j].signature.id) {
          // Already 'id' — keep it
        } else if (parsed[i].signature.routeHash && parsed[j].signature.routeHash &&
                   parsed[i].signature.routeHash === parsed[j].signature.routeHash) {
          if (confidence === 'id') confidence = 'id'; // id is stronger, keep
          if (confidence !== 'id') confidence = 'routeHash';
        } else {
          // Fuzzy match — only safe if strict enough
          confidence = 'fuzzy';
        }
        group.push(parsed[j]);
        assigned[j] = true;
      }
    }

    if (group.length === 1) {
      // Unique file, no duplicates
      groups.push({ canonical: group[0], duplicates: [], confidence, signature: group[0].signature });
    } else {
      const canonical = pickCanonical(group);
      const duplicates = group.filter(f => f !== canonical);
      groups.push({ canonical, duplicates, confidence, signature: group[0].signature });
    }
  }

  const uniqueGroups = groups.filter(g => g.duplicates.length === 0);
  const dupGroups = groups.filter(g => g.duplicates.length > 0);

  return { groups, unique: uniqueGroups, duplicateGroups: dupGroups, unparseable };
};