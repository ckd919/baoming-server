"""
Deep explore baominggongju.com via Playwright proxy mode
Login -> Explore ALL pages -> Extract features
"""
import asyncio, json, os, sys, io, time
from playwright.async_api import async_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PHONE = "13310843925"
PASSWORD = "Aled2239."
LOGIN_URL = "https://www.baominggongju.com/phoneLogin"
SCREEN = "deep_explore"
RESULT = {}

async def safe_click(page, selector, label="", timeout=5000):
    try:
        el = page.locator(selector).first
        if await el.count() > 0:
            await el.click()
            await page.wait_for_timeout(800)
            if label: print(f"    Clicked: {label}")
            return True
    except: pass
    return False

async def close_popups(page):
    for sel in ['.el-dialog__headerbtn', '.el-icon-close', '[class*="dialog"] [class*="close"]',
                '[class*="modal"] [class*="close"]', 'button[class*="close"]', '.close-btn']:
        try:
            btns = page.locator(sel)
            for i in range(min(await btns.count(), 3)):
                if await btns.nth(i).is_visible():
                    await btns.nth(i).click()
                    await page.wait_for_timeout(300)
        except: pass

async def take_screenshot(page, name):
    await page.screenshot(path=f"{SCREEN}/{name}.png", full_page=True)
    print(f"  [screenshot] {name}.png")

async def extract_text(page, selector="body", limit=2000):
    try:
        el = page.locator(selector).first
        if await el.count() > 0:
            return (await el.inner_text())[:limit]
    except: pass
    return ""

async def extract_links(page):
    return await page.evaluate("""
        () => Array.from(document.querySelectorAll('a[href], button')).map(el => ({
            text: (el.textContent||'').trim().slice(0, 60),
            href: (el.href||'').slice(0, 150),
            tag: el.tagName
        })).filter(x => x.text && x.text.length > 1 && x.text.length < 40).slice(0, 40)
    """)

async def extract_structure(page):
    return await page.evaluate("""
        () => {
            const sections = [];
            // 找主要的区块
            document.querySelectorAll('h1,h2,h3,h4,[class*=title],[class*=header],[class*=card],[class*=section]').forEach(el => {
                const text = (el.textContent||'').trim().slice(0, 120);
                if (text.length > 2 && text.length < 80) sections.push(text);
            });
            return [...new Set(sections)].slice(0, 30);
        }
    """)

async def main():
    os.makedirs(SCREEN, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            locale="zh-CN",
        )
        page = await ctx.new_page()

        # 捕获 API
        api_log = []
        page.on("response", lambda r: api_log.append({
            "url": r.url[:200], "status": r.status, "type": r.request.resource_type
        }) if r.status < 400 and any(k in r.url for k in ["api","graphql","query"]) else None)

        print("=" * 70)
        print("DEEP EXPLORE: baominggongju.com")
        print("=" * 70)

        # ========== STEP 1: LOGIN ==========
        print("\n[STEP 1] Login...")
        await page.goto(LOGIN_URL, wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_selector('input[placeholder="请输入您的手机号"]', timeout=10000)
        await page.get_by_placeholder("请输入您的手机号").fill(PHONE)
        await page.get_by_placeholder("请确认登录密码").fill(PASSWORD)
        await take_screenshot(page, "01_login_filled")
        await page.locator("form").get_by_role("button", name="登录", exact=True).click()

        try:
            await page.wait_for_url(lambda u: "/login" not in u and "/phoneLogin" not in u, timeout=15000)
        except: pass
        await page.wait_for_timeout(2000)
        print(f"  After login: {page.url}")
        await take_screenshot(page, "02_after_login")

        # ========== STEP 2: HOME/DASHBOARD ==========
        print("\n[STEP 2] Home page (/home)...")
        await page.goto("https://www.baominggongju.com/home", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)
        await close_popups(page)
        await take_screenshot(page, "03_home")

        home_text = await extract_text(page, "body", 1500)
        print(f"  Home content preview: {home_text[:400]}")
        RESULT["home"] = {
            "url": page.url,
            "nav": await extract_links(page),
            "sections": await extract_structure(page),
        }

        # ========== STEP 3: CREATE/发布流程 ==========
        print("\n[STEP 3] Create/Publish flow (/create)...")
        await page.goto("https://www.baominggongju.com/create", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)
        await close_popups(page)
        await take_screenshot(page, "04_create")

        RESULT["create"] = {
            "url": page.url,
            "sections": await extract_structure(page),
            "links": await extract_links(page),
        }
        print(f"  Create page sections: {RESULT['create']['sections'][:10]}")

        # ========== STEP 4: MANAGE PAGE ==========
        print("\n[STEP 4] Manage page (/manage)...")
        await page.goto("https://www.baominggongju.com/manage", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)
        await close_popups(page)
        await take_screenshot(page, "05_manage")

        # 提取活动列表
        activities = await page.evaluate("""
            () => {
                const items = [];
                document.querySelectorAll('[class*="list-item"], [class*="listitem"], li[class]').forEach(el => {
                    const text = (el.innerText||'').trim();
                    if (text.length > 10 && text.length < 300) {
                        items.push(text.split('\\n').filter(Boolean));
                    }
                });
                return items.slice(0, 15);
            }
        """)
        RESULT["manage"] = {
            "url": page.url,
            "activities": activities,
            "nav": await extract_links(page),
            "sections": await extract_structure(page),
        }
        print(f"  Activity count: {len(activities)}")
        for a in activities[:5]:
            print(f"    {a}")

        # ========== STEP 5: ENTER FIRST ACTIVITY DETAIL ==========
        print("\n[STEP 5] Activity detail (click '详情')...")
        detail_btn = page.locator('text="详情 >"').first
        if await detail_btn.count() == 0:
            detail_btn = page.locator('button:has-text("详情")').first
        if await detail_btn.count() == 0:
            detail_btn = page.locator('a:has-text("详情")').first

        if await detail_btn.count() > 0:
            old_url = page.url
            await detail_btn.click()
            try:
                await page.wait_for_url(lambda u: u != old_url, timeout=10000)
            except: pass
            await page.wait_for_timeout(2000)
            await close_popups(page)
            await take_screenshot(page, "06_activity_detail")
            print(f"  Detail URL: {page.url}")

            # 提取管理功能
            detail_btns = await page.evaluate("""
                () => Array.from(document.querySelectorAll('button, a.btn, [role=button], h3, [class*=title]'))
                    .map(el => ({text: (el.textContent||'').trim().slice(0, 60), tag: el.tagName}))
                    .filter(x => x.text.length > 1 && x.text.length < 30)
                    .slice(0, 40)
            """)
            RESULT["detail"] = {
                "url": page.url,
                "buttons": detail_btns,
                "sections": await extract_structure(page),
            }
            print(f"  Detail buttons: {[b['text'] for b in detail_btns[:20]]}")

            # ===== Explore management tabs =====
            # 尝试点击"管理"标签
            for tab_text in ['管理', '报名管理', '数据', '报名表单', '表单设置', '自定义', '设置', '通知', '签到']:
                try:
                    tab = page.locator(f'text="{tab_text}"').first
                    if await tab.count() > 0 and await tab.is_visible(timeout=1000):
                        await tab.click()
                        await page.wait_for_timeout(1000)
                        await close_popups(page)
                        await take_screenshot(page, f"07_tab_{tab_text}")
                        print(f"  Explored tab: {tab_text}")
                        RESULT[f"tab_{tab_text}"] = {
                            "text": await extract_text(page, "body", 1000),
                            "buttons": await extract_links(page),
                        }
                except: pass

        # ========== STEP 6: EXPLORE FORM BUILDER ==========
        print("\n[STEP 6] Looking for form/custom field builder...")
        # Try navigating to various form-related URLs
        for path in ['/form/setting', '/form/fields', '/activity/form', '/template']:
            try:
                await page.goto(f"https://www.baominggongju.com{path}", wait_until="domcontentloaded", timeout=10000)
                await page.wait_for_timeout(1000)
                txt = await extract_text(page, "body", 500)
                if txt and len(txt) > 50 and 'not found' not in txt.lower():
                    await take_screenshot(page, f"08_form_{path.replace('/','_')}")
                    print(f"  Found page: {path} -> {txt[:100]}")
                    RESULT[f"form_{path}"] = {"text": txt[:800]}
            except: pass

        # ========== STEP 7: TRY CREATE NEW ACTIVITY ==========
        print("\n[STEP 7] Create new activity flow...")
        await page.goto("https://www.baominggongju.com/create", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)
        await close_popups(page)

        # Look for "blank" or "自定义" create button
        for btn_text in ['创建', '空白', '自定义', '新建', '发布活动', '免费发起']:
            try:
                btn = page.locator(f'text="{btn_text}"').first
                if await btn.count() > 0 and await btn.is_visible():
                    print(f"  Found button: {btn_text}")
            except: pass

        await take_screenshot(page, "09_create_final")

        # Try clicking "免费发起活动" or similar CTA
        cta_clicked = False
        for cta in ['免费发起', '创建活动', '立即创建', '发起报名', '新建活动']:
            try:
                btn = page.locator(f'text="{cta}"').first
                if await btn.count() > 0 and await btn.is_visible():
                    await btn.click()
                    await page.wait_for_timeout(2000)
                    await take_screenshot(page, f"10_after_{cta}")
                    print(f"  Clicked: {cta} -> {page.url}")
                    RESULT[f"cta_{cta}"] = {
                        "url": page.url,
                        "text": await extract_text(page, "body", 1000),
                    }
                    cta_clicked = True
                    break
            except: pass

        # ========== STEP 8: CAPTURE ALL API CALLS ==========
        print(f"\n[STEP 8] API calls captured: {len(api_log)}")
        # Filter unique API URLs
        api_urls = list(set([a['url'] for a in api_log if 'api' in a['url'] or 'graphql' in a['url']]))
        RESULT["api_calls"] = api_urls[:30]
        for u in api_urls[:20]:
            print(f"  {u}")

        # ========== STEP 9: EXPLORE TEMPLATES ==========
        print("\n[STEP 9] Templates...")
        await page.goto("https://www.baominggongju.com/home", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(2000)

        # Look for template center link
        tpl_link = page.locator('text="模板中心"').first
        if await tpl_link.count() > 0 and await tpl_link.is_visible():
            await tpl_link.click()
            await page.wait_for_timeout(2000)
            await take_screenshot(page, "11_templates")

            tpl_text = await extract_text(page, "body", 1500)
            RESULT["templates"] = {
                "text": tpl_text[:1000],
                "links": await extract_links(page),
            }
            print(f"  Templates: {tpl_text[:400]}")

        # ========== STEP 10: PERSONAL CENTER ==========
        print("\n[STEP 10] Personal center...")
        for text in ['个人中心', '个人', '我的', '设置']:
            try:
                btn = page.locator(f'text="{text}"').first
                if await btn.count() > 0 and await btn.is_visible():
                    await btn.click()
                    await page.wait_for_timeout(2000)
                    await take_screenshot(page, f"12_{text}")
                    RESULT[f"page_{text}"] = {
                        "text": await extract_text(page, "body", 800),
                        "links": await extract_links(page),
                    }
                    print(f"  Explored: {text}")
                    break
            except: pass

        # ========== SAVE ==========
        with open(f"{SCREEN}/deep_findings.json", "w", encoding="utf-8") as f:
            # 清理不可序列化的内容
            clean = {}
            for k, v in RESULT.items():
                if isinstance(v, dict):
                    clean[k] = {kk: vv for kk, vv in v.items() if isinstance(vv, (str, int, list, dict, bool))}
            json.dump(clean, f, ensure_ascii=False, indent=2)

        print("\n" + "=" * 70)
        print("DEEP EXPLORE COMPLETE")
        print(f"Screenshots saved to: {os.path.abspath(SCREEN)}/")
        for fn in sorted(os.listdir(SCREEN)):
            print(f"  {fn}")
        print(f"API endpoints found: {len(api_urls)}")
        print("=" * 70)

        print("\nBrowser stays open 30s for manual inspection...")
        await page.wait_for_timeout(30000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
