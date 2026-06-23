"""
探索 baominggongju.com 管理后台 - 参考 zuqiu/enroll.py 的成功登录逻辑
"""
import asyncio, json, os, sys, io
from playwright.async_api import async_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

PHONE = "13310843925"
PASSWORD = "Aled2239."  # zuqiu 项目里用的密码带点！
LOGIN_URL = "https://www.baominggongju.com/phoneLogin"
MANAGE_URL = "https://www.baominggongju.com/manage"
SCREEN = "explore_screenshots"

async def main():
    os.makedirs(SCREEN, exist_ok=True)
    findings = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            locale="zh-CN",
        )
        page = await ctx.new_page()

        print("=" * 60)
        print("Exploring baominggongju.com ADMIN pages (referencing zuqiu/enroll.py)")
        print(f"Login: {LOGIN_URL}")
        print(f"Manage: {MANAGE_URL}")
        print("=" * 60)

        # ====== 1. 登录 ======
        print("\n[1] Login via phoneLogin...")
        try:
            await page.goto(LOGIN_URL, wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_selector('input[placeholder="请输入您的手机号"]', timeout=8000, state="visible")
            await page.screenshot(path=f"{SCREEN}/admin_01_phone_login.png", full_page=True)

            # 填表
            await page.get_by_placeholder("请输入您的手机号").fill(PHONE)
            await page.get_by_placeholder("请确认登录密码").fill(PASSWORD)
            await page.screenshot(path=f"{SCREEN}/admin_02_filled.png", full_page=True)

            # 点击登录
            await page.locator("form").get_by_role("button", name="登录", exact=True).click()

            # 等跳转
            try:
                await page.wait_for_url(lambda u: "/login" not in u and "/phoneLogin" not in u, timeout=12000)
                await page.wait_for_load_state("domcontentloaded", timeout=5000)
            except:
                pass

            if "/login" not in page.url and "/phoneLogin" not in page.url:
                print(f"  LOGIN SUCCESS -> {page.url}")
                await page.screenshot(path=f"{SCREEN}/admin_03_logged_in.png", full_page=True)
            else:
                print(f"  Login may have failed: {page.url}")
        except Exception as e:
            print(f"  Login error: {e}")

        # ====== 2. 管理后台 ======
        print("\n[2] Navigating to manage page...")
        try:
            await page.goto(MANAGE_URL, wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_timeout(2000)

            # 关闭可能的弹窗
            try:
                close_btns = page.locator('[class*="close"], [class*="dialog"] [class*="header"] button, .el-icon-close')
                for i in range(min(await close_btns.count(), 3)):
                    btn = close_btns.nth(i)
                    if await btn.is_visible():
                        await btn.click()
                        await page.wait_for_timeout(400)
            except:
                pass

            await page.screenshot(path=f"{SCREEN}/admin_04_manage_page.png", full_page=True)

            # 提取管理页内容
            page_text = await page.evaluate("""
                () => document.body.innerText.slice(0, 3000)
            """)
            print(f"  Page content preview:\n{page_text[:600]}")

            # 提取活动列表
            activities = await page.evaluate("""
                () => {
                    const items = document.querySelectorAll(
                        '[class*="listitem"], [class*="list-item"], [class*="ListItem"], li[class]'
                    );
                    return Array.from(items).slice(0, 20).map(el => ({
                        text: (el.innerText || '').split('\\n')[0].trim().slice(0, 60),
                        html: el.outerHTML?.slice(0, 200)
                    })).filter(x => x.text);
                }
            """)
            findings["activities"] = activities
            print(f"\n  Activities found: {len(activities)}")
            for a in activities[:15]:
                print(f"    - {a['text'][:60]}")

        except Exception as e:
            print(f"  Manage page error: {e}")

        # ====== 3. 探索导航/侧边栏 ======
        print("\n[3] Exploring navigation...")
        nav_items = await page.evaluate("""
            () => {
                const items = [];
                document.querySelectorAll('nav a, .sidebar a, [class*=nav] a, [class*=menu] a, [class*=tab]').forEach(a => {
                    const text = (a.textContent||'').trim();
                    if (text && text.length < 30) items.push({text, href: a.href?.slice(0, 120)});
                });
                return items.slice(0, 30);
            }
        """)
        findings["navigation"] = nav_items
        print(f"  Nav items: {len(nav_items)}")
        for n in nav_items[:20]:
            print(f"    -> {n['text'][:30]} | {n['href'][:50]}")

        # ====== 4. 进入第一个活动详情（如果有） ======
        print("\n[4] Trying to enter first activity detail...")
        try:
            detail_btn = page.locator('text="详情 >"').first
            if await detail_btn.count() == 0:
                detail_btn = page.locator('button:has-text("详情")').first
            if await detail_btn.count() == 0:
                detail_btn = page.locator('a:has-text("详情")').first

            if await detail_btn.count() > 0 and await detail_btn.is_visible():
                print("  Found detail button, clicking...")
                old_url = page.url
                await detail_btn.click()
                try:
                    await page.wait_for_url(lambda u: u != old_url, timeout=8000)
                except:
                    pass
                await page.wait_for_timeout(2000)
                await page.screenshot(path=f"{SCREEN}/admin_05_activity_detail.png", full_page=True)
                print(f"  Detail page: {page.url}")

                # 提取管理功能按钮
                mgmt_btns = await page.evaluate("""
                    () => Array.from(document.querySelectorAll('button, a, .btn, [role=button]'))
                        .map(el => (el.textContent||'').trim())
                        .filter(t => t.length > 1 && t.length < 20)
                        .slice(0, 30)
                """)
                findings["detail_buttons"] = mgmt_btns
                print(f"  Management buttons: {mgmt_btns}")

                # 试试点「管理」或「表单设置」
                for btn_text in ['管理', '表单设置', '编辑', '报名表单', '自定义', '设置']:
                    try:
                        btn = page.locator(f'text="{btn_text}"').first
                        if await btn.count() > 0 and await btn.is_visible():
                            await btn.click()
                            await page.wait_for_timeout(1500)
                            await page.screenshot(
                                path=f"{SCREEN}/admin_06_{btn_text}.png", full_page=True
                            )
                            print(f"  Clicked '{btn_text}', screenshot saved")
                    except:
                        pass
        except Exception as e:
            print(f"  Detail page error: {e}")

        # ====== 5. 保存 ======
        with open(f"{SCREEN}/admin_findings.json", "w", encoding="utf-8") as f:
            json.dump(findings, f, ensure_ascii=False, indent=2)

        print("\n" + "=" * 60)
        print("Done! Screenshots:")
        for fn in sorted(os.listdir(SCREEN)):
            if fn.startswith('admin_'):
                print(f"  {fn}")
        print("=" * 60)

        print("\nBrowser stays open 20s for manual inspection...")
        await page.wait_for_timeout(20000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
