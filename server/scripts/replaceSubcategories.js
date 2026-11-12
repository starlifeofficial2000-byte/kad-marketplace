/**
 * Replace all existing child Category rows with the curated taxonomy.
 * Safe by default: run with --dry-run (default) to preview. Add --apply to write.
 * Existing parent category rows and Product rows are not deleted or modified.
 * Product.subcategory is a text snapshot, so existing listings may retain their
 * old subcategory text until sellers edit them; review the report before apply.
 */
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const Category = require('../models/Category');
const taxonomy = require('../data/subcategory-taxonomy.json');

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
const slugify = (value) => normalize(value).replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const apply = process.argv.includes('--apply');

(async () => {
  const transaction = await sequelize.transaction();
  try {
    const parents = await Category.findAll({ where: { parentId: null }, order: [['displayOrder', 'ASC'], ['id', 'ASC']], transaction });
    const children = await Category.findAll({ where: { parentId: { [require('sequelize').Op.ne]: null } }, transaction });
    const planned = [];
    const unmatched = [];
    for (const parent of parents) {
      const names = taxonomy[normalize(parent.name)];
      if (!names) { unmatched.push(parent.name); continue; }
      planned.push({ parent, names });
    }

    console.log(`Mode: ${apply ? 'APPLY' : 'DRY RUN'}`);
    console.log(`Parent categories found: ${parents.length}`);
    console.log(`Existing subcategories to replace: ${children.length}`);
    for (const { parent, names } of planned) {
      console.log(`\n${parent.name} (${parent.id}) — ${names.length} new subcategories`);
      names.forEach((name, index) => console.log(`  ${index + 1}. ${name}`));
    }
    if (unmatched.length) console.log(`\nNo taxonomy configured for these existing parent categories: ${unmatched.join(', ')}`);

    if (!apply) {
      await transaction.rollback();
      console.log('\nPreview only. No database changes made. Review the list, then rerun with --apply to replace subcategories.');
      process.exitCode = unmatched.length ? 2 : 0;
      return;
    }

    // Delete child rows only; parent categories and products remain untouched.
    await Category.destroy({ where: { parentId: { [require('sequelize').Op.ne]: null } }, transaction });
    let created = 0;
    for (const { parent, names } of planned) {
      for (let index = 0; index < names.length; index += 1) {
        const name = names[index];
        await Category.create({
          name,
          slug: `${slugify(parent.name)}-${slugify(name)}`,
          parentId: parent.id,
          featured: false,
          homepage: false,
          displayOrder: index + 1,
          status: true
        }, { transaction });
        created += 1;
      }
    }
    await transaction.commit();
    console.log(`\nCompleted. Created ${created} subcategories under ${planned.length} matched parent categories.`);
    if (unmatched.length) console.warn('Unmatched parent categories were left without subcategories; add taxonomy entries for them and rerun if needed.');
  } catch (error) {
    await transaction.rollback();
    console.error('Subcategory replacement failed; transaction rolled back:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
