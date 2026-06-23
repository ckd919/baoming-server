"""
小棕熊报名工具 - 竞品探索脚本
使用 Playwright 登录 baominggongju.com，探索自定义收集功能
"""

import asyncio
import json
import os
import sys
import io
from playwright.async_api import async_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PHONE = "13310843925"
PASSWORD = "Aled2239"
BASE_URL = "https://www.baominggongju.com"
SCREENSHOT_DIR = "explore_screenshots"

async def safe_goto(page, url, label="", timeout=20000):
    """安全导航：多种策略尝试"""
    strategies = ["load", "domcontentloaded"]
    for strategy in strategies:
        try:
            print(f"  [{label}] 尝试 {strategy}...")
            await page.goto(url, wait_until=strategy, timeout=timeout)
            await page.wait_for_timeout(1500)
            print(f"  [{label}] 成功: {strategy}")
            return True
        except Exception as e:
            print(f"  [{label}] {strategy} 失败: {str(e)[:80]}")
    return False

async def main():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    findings = {"pages": {}, "features": [], "field_types": [], "api_calls": []}

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            locale="zh-CN",
        )
        page = await context.new_page()

        # 抓 API
        page.on("request", lambda req: findings["api_calls"].append({
            "url": req.url[:200], "method": req.method, "type": req.resource_type
        }) if any(k in req.url.lower() for k in ["api", "graphql", "rest", "query"]) else None)

        print("=" * 60)
        print("[XiaoZongXiong] Exploring baominggongju.com")
        print("=" * 60)

        # ====== 1. 首页 ======
        print("\n[1/5] Homepage...")
        if await safe_goto(page, BASE_URL, "homepage"):
            await page.screenshot(path=f"{SCREENSHOT_DIR}/01_homepage.png", full_page=True)
            title = await page.title()
            print(f"  Title: {title}")
            findings["pages"]["home"] = {"title": title, "url": page.url}

            # 提取导航和按钮
            nav_texts = await page.evaluate("""
                () => Array.from(document.querySelectorAll('a, button, [role=button], nav *, header *'))
                    .slice(0, 20).map(el => ({
                        text: (el.textContent||'').trim().slice(0, 60),
                        href: el.href||'',
                        tag: el.tagName
                    })).filter(x => x.text && x.text.length > 1 && x.text.length < 30)
            """)
            print(f"  Nav items: {len(nav_texts)}")
            for n in nav_texts[:12]:
                print(f"    [{n['tag']}] {n['text'][:40]}")

        # ====== 2. 登录 ======
        print("\n[2/5] Login...")
        login_urls = [f"{BASE_URL}/login", f"{BASE_URL}/signin", f"{BASE_URL}/user/login"]
        logged_in = False

        for login_url in login_urls:
            if not logged_in and await safe_goto(page, login_url, "login", 15000):
                await page.screenshot(path=f"{SCREENSHOT_DIR}/02_login.png", full_page=True)

                # 填表
                try:
                    inputs = page.locator('input')
                    icount = await inputs.count()
                    print(f"  Found {icount} inputs")

                    for i in range(min(icount, 5)):
                        inp = inputs.nth(i)
                        tp = await inp.get_attribute('type') or ''
                        ph = await inp.get_attribute('placeholder') or ''
                        nm = await inp.get_attribute('name') or ''
                        pid = await inp.get_attribute('id') or ''
                        print(f"    input[{i}]: type={tp}, placeholder={ph[:30]}, name={nm}, id={pid}")

                        if tp in ('tel', 'text', 'number') or '手机' in ph or 'phone' in nm.lower():
                            await inp.fill(PHONE)
                            print(f"    -> filled phone")
                        elif tp == 'password':
                            await inp.fill(PASSWORD)
                            print(f"    -> filled password")

                    await page.screenshot(path=f"{SCREENSHOT_DIR}/03_login_filled.png", full_page=True)

                    # 点登录
                    btns = page.locator('button')
                    bcount = await btns.count()
                    for i in range(min(bcount, 15)):
                        btn = btns.nth(i)
                        text = (await btn.text_content() or '').strip()
                        if '登录' in text and len(text) < 10:
                            await btn.click()
                            print(f"  Clicked: {text}")
                            await page.wait_for_timeout(3000)
                            logged_in = True
                            break

                    if logged_in:
                        await page.screenshot(path=f"{SCREENSHOT_DIR}/04_after_login.png", full_page=True)
                        findings["pages"]["logged_in"] = {"url": page.url}
                        break
                except Exception as e:
                    print(f"  Login error: {e}")

        # ====== 3. 创建发布页 ======
        print("\n[3/5] Create/Publish page...")
        create_urls = [f"{BASE_URL}/create", f"{BASE_URL}/publish", f"{BASE_URL}/activity/create"]
        for curl in create_urls:
            if await safe_goto(page, curl, "create", 15000):
                await page.screenshot(path=f"{SCREENSHOT_DIR}/05_create.png", full_page=True)
                findings["pages"]["create"] = {"url": page.url}

                # 提取功能卡片
                cards = await page.evaluate("""
                    () => Array.from(document.querySelectorAll('[class*=card], [class*=item], [class*=feature], li, .menu-item'))
                        .slice(0, 30).map(el => (el.textContent||'').trim().slice(0, 100))
                        .filter(t => t.length > 3 && t.length < 60)
                """)
                findings["features"] = list(set(cards))[:30]
                print(f"  Features found: {len(findings['features'])}")
                for f in findings["features"][:15]:
                    print(f"    - {f[:70]}")

                # 找"自定义收集"
                clicked_custom = await page.evaluate("""
                    () => {
                        for (const el of document.querySelectorAll('a, button, div, span, li')) {
                            const t = (el.textContent||'').trim();
                            if (t.includes('自定义') && (t.includes('收集') || t.includes('表单'))) {
                                el.click(); return t;
                            }
                        }
                        return null;
                    }
                """)
                if clicked_custom:
                    print(f"  Clicked: {clicked_custom}")
                    await page.wait_for_timeout(2000)
                    await page.screenshot(path=f"{SCREENSHOT_DIR}/06_custom_form.png", full_page=True)
                break

        # ====== 4. 提取字段组件 ======
        print("\n[4/5] Extracting form field types...")
        await page.wait_for_timeout(1000)
        fields = await page.evaluate("""
            () => {
                const found = [];
                const seen = new Set();
                // 广泛搜索
                for (const el of document.querySelectorAll('*')) {
                    const cls = (el.className && typeof el.className === 'string') ? el.className : '';
                    const text = (el.textContent||'').trim();
                    if (text.length >= 1 && text.length <= 20 && cls.length > 0 && !seen.has(text)) {
                        // 只保留可能的字段类型标签
                        if (/field|type|component|widget|item|label|element|input|select/i.test(cls)) {
                            seen.add(text);
                            found.push({text, cls: cls.slice(0, 80)});
                        }
                    }
                }
                return found.slice(0, 40);
            }
        """)
        findings["field_types"] = fields
        print(f"  Potential field types: {len(fields)}")
        for f in fields[:25]:
            print(f"    - {f['text'][:40]}")

        # ====== 5. 保存结果 ======
        print("\n[5/5] Saving results...")

        # 最终截图
        await page.screenshot(path=f"{SCREENSHOT_DIR}/99_final.png", full_page=True)

        # 保存 JSON
        with open(f"{SCREENSHOT_DIR}/findings.json", "w", encoding="utf-8") as f:
            json.dump(findings, f, ensure_ascii=False, indent=2)

        print("\n" + "=" * 60)
        print("Done!")
        print(f"Screenshots: {os.path.abspath(SCREENSHOT_DIR)}/")
        for fn in sorted(os.listdir(SCREENSHOT_DIR)):
            print(f"  - {fn}")
        print(f"API calls captured: {len(findings['api_calls'])}")
        print(f"Features found: {len(findings['features'])}")
        print(f"Field types found: {len(findings['field_types'])}")
        print("=" * 60)

        print("\nBrowser stays open 15s for manual inspection...")
        await page.wait_for_timeout(15000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
