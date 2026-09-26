-- 富地房屋：把帳號加進員工名單（名單內的帳號才能管理物件）
-- 先在 Dashboard → Authentication → Users → Add user → Create new user 建立帳號
-- （勾選 Auto Confirm User），再把下面的 email 換成該帳號執行。每加一位員工執行一次。

insert into public.staff (user_id)
select id from auth.users where email = 'staff@example.com'
on conflict (user_id) do nothing;

-- 確認目前員工名單
select u.email, s.created_at
from public.staff s
join auth.users u on u.id = s.user_id
order by s.created_at;

-- 移除員工（離職時）：
-- delete from public.staff where user_id = (select id from auth.users where email = 'staff@example.com');
