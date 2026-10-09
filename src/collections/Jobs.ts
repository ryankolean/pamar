import type { CollectionConfig } from 'payload'

/**
 * Job postings with the draft, review and publish workflow (SUMMIT-259).
 *
 * `versions.drafts` is the part worth proving: it makes the adapter generate the
 * `_jobs_v*` version tables, which is where SQLite adapters tend to break.
 */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'reviewState', 'updatedAt'] },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    {
      name: 'reviewState',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In review', value: 'in-review' },
        { label: 'Approved', value: 'approved' },
      ],
    },
    { name: 'location', type: 'text' },
    {
      name: 'employmentType',
      type: 'select',
      options: [
        { label: 'Full time', value: 'full-time' },
        { label: 'Seasonal', value: 'seasonal' },
      ],
    },
    { name: 'validThrough', type: 'date' },
    {
      name: 'trades',
      type: 'array',
      fields: [{ name: 'name', type: 'text', required: true }],
    },
  ],
}
