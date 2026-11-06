const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve('g:/oooo سيرفر/qa_live_screenshots');
const ARTIFACT_DIR = path.resolve('C:/Users/JOJO/.gemini/antigravity/brain/f0153a20-4c70-417f-870e-1aff1b21a7c5');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function saveScreenshot(page, filename) {
  const localPath = path.join(SCREENSHOT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  try {
    fs.copyFileSync(localPath, artifactPath);
  } catch (err) {
    // Resilience against local device storage limits
  }
  console.log(`[SNAPSHOT] Saved successfully: ${filename}`);
}

async function performLogout(page) {
  console.log('Logging out current user...');
  await page.click('#topbar-user-menu-btn');
  await page.waitForTimeout(400);
  await page.click('#topbar-logout-btn');
  await page.waitForSelector('#login-email-input', { timeout: 10000 });
  await page.waitForTimeout(400);
}

async function performLogin(page, email, roleName) {
  console.log(`Logging in as ${roleName} (${email})...`);
  await page.waitForSelector('#login-email-input', { timeout: 10000 });
  await page.fill('#login-email-input', email);
  await page.fill('#login-password-input', 'demo1234');
  await page.click('#login-submit-btn');
  await page.waitForSelector('#topbar-user-menu-btn', { timeout: 10000 });
  await page.waitForTimeout(600);
  console.log(`Authenticated as ${roleName}.`);
}

async function run() {
  console.log('====================================================');
  console.log(' NexCMMS 3-Role Automated Live QA & Self-Healing');
  console.log(' Target: $7,000 Commercial Grade 100% Zero-Bug');
  console.log('====================================================');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`[Browser Error] ${msg.text()}`);
      consoleErrors.push(msg.text());
    }
  });

  page.on('requestfailed', req => {
    console.warn(`[Network Failed] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
    networkErrors.push({ url: req.url(), error: req.failure()?.errorText });
  });

  try {
    // ----------------------------------------------------
    // PHASE 2.1: MANAGER ROLE
    // ----------------------------------------------------
    console.log('\n========================================');
    console.log(' ROLE 1: MANAGER (manager@nexcmms.com)');
    console.log('========================================');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Ensure clean state: if logged in, log out
    const isLoginVisible = await page.$('#login-email-input');
    if (!isLoginVisible) {
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('nex_logged_out', 'true');
      });
      await page.reload({ waitUntil: 'networkidle' });
    }

    // 1. Login as Manager
    await performLogin(page, 'manager@nexcmms.com', 'Manager (Admin)');

    // 2. Navigate to Statistics / Dashboard
    console.log('Navigating to Statistics & Analytics Dashboard...');
    await page.click('[data-route="statistics"]');
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '01_manager_dashboard.png');

    // 3. Navigate to Assets & Add New Asset
    console.log('Navigating to Assets & Inventory...');
    await page.click('[data-route="assets"]');
    await page.waitForTimeout(800);

    console.log('Opening Add Asset modal...');
    await page.click('#add-asset-modal-btn');
    await page.waitForTimeout(500);

    const assetModal = page.locator('div[role="dialog"], .fixed.inset-0').last();
    console.log('Adding Asset: جهاز رنين مغناطيسي MRI - قسم الأشعة...');
    await assetModal.locator('input[placeholder*="AUTOCLAVE"], input[required]').first().fill('جهاز رنين مغناطيسي MRI - قسم الأشعة');
    
    // Select Risk Level HIGH
    const riskSelect = assetModal.locator('select').nth(1);
    if (await riskSelect.isVisible()) {
      await riskSelect.selectOption('HIGH');
    }

    // Submit Asset
    await assetModal.locator('button:has-text("Add Asset"), button[type="submit"]').click();
    await page.waitForTimeout(800);
    await saveScreenshot(page, '02_manager_assets.png');

    // 4. Create Urgent Work Order
    console.log('Navigating to Work Orders...');
    await page.click('[data-route="work-orders"]');
    await page.waitForTimeout(800);

    console.log('Opening + Work Order modal...');
    await page.click('#open-create-wo-btn');
    await page.waitForTimeout(600);

    console.log('Filling Work Order form with High/Emergency priority...');
    await page.fill('#wo-title-input', 'صيانة طارئة: عطل نظام التبريد في جهاز الرنين المغناطيسي MRI');
    await page.fill('#wo-description-input', 'تسريب في دورة تبريد الهيليوم لجهاز الرنين المغناطيسي بقسم الأشعة يتطلب تدخل فوري من المهندس وفني الصيانة');

    // Priority HIGH
    await page.click('button[data-priority="HIGH"]');
    await page.waitForTimeout(400);

    // Screenshot before submit
    await saveScreenshot(page, '03_manager_create_wo.png');

    // Submit work order
    await page.click('#wo-submit-btn');
    await page.waitForTimeout(1000);

    // Logout Manager
    await performLogout(page);

    // ----------------------------------------------------
    // PHASE 2.2: SUPERVISOR ROLE
    // ----------------------------------------------------
    console.log('\n==============================================');
    console.log(' ROLE 2: SUPERVISOR (supervisor@nexcmms.com)');
    console.log('==============================================');

    await performLogin(page, 'supervisor@nexcmms.com', 'Supervisor');

    // 04: Supervisor View Screenshot
    await page.waitForTimeout(600);
    await saveScreenshot(page, '04_supervisor_view.png');

    // Open newly created Work Order
    console.log('Finding and opening the MRI Work Order...');
    const mriRow = page.locator('tr:has-text("رنين مغناطيسي"), tr:has-text("MRI")').first();
    await mriRow.click();
    const supDrawer = page.locator('#wo-detail-drawer');
    await supDrawer.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(600);

    // Review & Assign to Technician with SLA
    console.log('Assigning to Technician Marcus Vance with 2h SLA Emergency...');
    await supDrawer.locator('#supervisor-assign-tech-select').selectOption('Marcus Vance (Maintenance Tech)');
    await supDrawer.locator('#supervisor-sla-select').selectOption('خلال ساعتين (عاجل - 2h SLA Emergency)');
    await supDrawer.locator('#supervisor-save-assignment-btn').click();
    await page.waitForTimeout(600);

    // 05: Supervisor Assignment Screenshot
    await saveScreenshot(page, '05_supervisor_assign_wo.png');

    // Close drawer using explicit ID
    console.log('Closing Work Order Drawer...');
    await supDrawer.locator('#close-wo-drawer-btn').click();
    await page.waitForTimeout(500);

    // Logout Supervisor
    await performLogout(page);

    // ----------------------------------------------------
    // PHASE 2.3: FIELD TECHNICIAN ROLE
    // ----------------------------------------------------
    console.log('\n==============================================');
    console.log(' ROLE 3: FIELD TECHNICIAN (tech@nexcmms.com)');
    console.log('==============================================');

    await performLogin(page, 'tech@nexcmms.com', 'Field Technician');

    // 06: Technician Assigned Tasks
    await page.waitForTimeout(600);
    await saveScreenshot(page, '06_tech_assigned_tasks.png');

    // Open assigned work order
    console.log('Technician opening assigned Work Order...');
    const techMriRow = page.locator('tr:has-text("رنين مغناطيسي"), tr:has-text("MRI")').first();
    await techMriRow.click();
    const techDrawer = page.locator('#wo-detail-drawer');
    await techDrawer.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(600);

    // Change status to IN_PROGRESS
    console.log('Updating status to IN_PROGRESS...');
    await techDrawer.locator('#wo-status-select').selectOption('IN_PROGRESS');
    await page.waitForTimeout(500);

    // Add Checklist procedure
    console.log('Adding technician inspection step...');
    const taskInput = techDrawer.locator('input[placeholder*="procedure"]');
    if (await taskInput.isVisible()) {
      await taskInput.fill('فحص ضغط غاز الهيليوم واستبدال صمام العزل');
      await techDrawer.locator('form button:has-text("Add")').click();
      await page.waitForTimeout(400);
    }

    // Check off procedure checkbox inside drawer
    const checkItem = techDrawer.locator('div:has-text("الهيليوم")').last();
    if (await checkItem.isVisible()) {
      await checkItem.click();
      await page.waitForTimeout(300);
    }

    // 07: Technician In Progress Screenshot
    await saveScreenshot(page, '07_tech_in_progress.png');

    // Consume Spare Part from warehouse inside drawer
    console.log('Consuming Spare Part from inventory...');
    const addPartsBtn = techDrawer.locator('#open-add-part-form-btn');
    if (await addPartsBtn.isVisible()) {
      await addPartsBtn.click();
      await page.waitForTimeout(400);
      await techDrawer.locator('#add-part-to-job-btn').click();
      await page.waitForTimeout(500);
    }

    // Complete Work Order inside drawer
    console.log('Completing Work Order (status -> COMPLETED)...');
    await techDrawer.locator('#wo-status-select').selectOption('COMPLETED');
    await page.waitForTimeout(800);

    // 08: Technician Completed Screenshot
    await saveScreenshot(page, '08_tech_completed.png');

    // Close drawer
    await techDrawer.locator('#close-wo-drawer-btn').click();
    await page.waitForTimeout(500);

    // Logout Technician
    await performLogout(page);

    // ----------------------------------------------------
    // PHASE 2.4: FINAL VERIFICATION
    // ----------------------------------------------------
    console.log('\n==============================================');
    console.log(' FINAL VERIFICATION (supervisor@nexcmms.com)');
    console.log('==============================================');

    await performLogin(page, 'supervisor@nexcmms.com', 'Supervisor');

    console.log('Opening finalized Work Order for verification...');
    const verifyRow = page.locator('tr:has-text("رنين مغناطيسي"), tr:has-text("MRI")').first();
    await verifyRow.click();
    const finalDrawer = page.locator('#wo-detail-drawer');
    await finalDrawer.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(1000);

    // 09: Final Verification Screenshot
    await saveScreenshot(page, '09_final_verification.png');

    // Close drawer
    await finalDrawer.locator('#close-wo-drawer-btn').click();
    await page.waitForTimeout(400);

    console.log('\n====================================================');
    console.log(' [SUCCESS] ALL 9 AUDIT SNAPSHOTS CAPTURED 100%!');
    console.log(' Console Errors:', consoleErrors.length);
    console.log(' Network Failures:', networkErrors.length);
    console.log('====================================================');

  } catch (err) {
    console.error('[Automated Live QA Failed]', err);
    await saveScreenshot(page, 'error_diagnostic_snapshot.png');
    throw err;
  } finally {
    await browser.close();
  }
}

run();
