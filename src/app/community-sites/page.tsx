import React from 'react';
import Papa from 'papaparse';
import CommunityDashboard from './CommunityDashboard';

export const revalidate = 60; // Revalidate every 60 seconds

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqA_1gGSS0BIZyVNHMGWjr8KfKV82-KA9SzlB0P3IiRCcpAF6Ccmkfldk7uDfUldYpJDVYbHwPY0Hc/pub?gid=1151837083&single=true&output=csv";
const FORM_URL = "https://docs.google.com/forms/d/11fN7shnukFB0KGLznMvADmaLY8Axoe0lS5VeVASKOSA/viewform";

async function getSites() {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error("Failed to fetch CSV");
      return [];
    }
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    
    // Filter only approved sites
    return parsed.data.filter((row: any) => {
      const approved = row.Approved?.toLowerCase().trim();
      return approved === 'yes' || approved === 'true' || approved === '1';
    });
  } catch (error) {
    console.error("Error fetching community sites:", error);
    return [];
  }
}

export default async function CommunitySitesPage() {
  const sites = await getSites();

  return (
    <main className="min-h-screen bg-surface">
      <CommunityDashboard sites={sites as any} formUrl={FORM_URL} />
    </main>
  );
}
