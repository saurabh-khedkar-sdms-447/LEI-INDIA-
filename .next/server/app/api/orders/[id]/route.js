"use strict";(()=>{var e={};e.id=87,e.ids=[87],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},59029:(e,r,t)=>{t.a(e,async(e,o)=>{try{t.r(r),t.d(r,{originalPathname:()=>f,patchFetch:()=>d,requestAsyncStorage:()=>p,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>l});var n=t(12085),s=t(31650),i=t(85980),a=t(23599),u=e([a]);a=(u.then?(await u)():u)[0];let c=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/orders/[id]/route",pathname:"/api/orders/[id]",filename:"route",bundlePath:"app/api/orders/[id]/route"},resolvedPagePath:"/home/stark/leiindias/app/api/orders/[id]/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:p,staticGenerationAsyncStorage:l,serverHooks:m}=c,f="/api/orders/[id]/route";function d(){return(0,i.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:l})}o()}catch(e){o(e)}})},23599:(e,r,t)=>{t.a(e,async(e,o)=>{try{t.r(r),t.d(r,{GET:()=>d,PUT:()=>c});var n=t(30627),s=t(6415),i=t(83136),a=t(29802),u=e([i]);i=(u.then?(await u)():u)[0];let p=s.Ry({status:s.Km(["pending","quoted","approved","rejected"]).optional(),notes:s.Z_().optional()}).refine(e=>Object.keys(e).length>0,{message:"At least one field must be provided for update"});async function d(e,{params:r}){try{let t=(0,a.Ax)(e);if(t instanceof n.NextResponse)return t;let o=(await i.w.query(`
      SELECT
        o.id,
        o."companyName",
        o."contactName",
        o.email,
        o.phone,
        o."companyAddress",
        o.notes,
        o.status,
        o."createdAt",
        o."updatedAt",
        json_agg(
          json_build_object(
            'id', oi.id,
            'orderId', oi."orderId",
            'productId', oi."productId",
            'sku', oi.sku,
            'name', oi.name,
            'quantity', oi.quantity,
            'notes', oi.notes
          )
        ) AS items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
      WHERE o.id = $1
      GROUP BY o.id
      LIMIT 1
      `,[r.id])).rows[0];if(!o)return n.NextResponse.json({error:"Order not found"},{status:404});return n.NextResponse.json(o)}catch(e){return console.error("Error fetching order:",e),n.NextResponse.json({error:"Failed to fetch order"},{status:500})}}async function c(e,{params:r}){try{let t=(0,a.Ax)(e);if(t instanceof n.NextResponse)return t;let o=await e.json(),s=p.parse(o),u=(await i.w.query(`
      UPDATE "Order"
      SET
        status = COALESCE($1, status),
        notes = COALESCE($2, notes),
        "updatedAt" = NOW()
      WHERE id = $3
      RETURNING
        id,
        "companyName",
        "contactName",
        email,
        phone,
        "companyAddress",
        notes,
        status,
        "createdAt",
        "updatedAt"
      `,[s.status??null,s.notes??null,r.id])).rows[0];if(!u)return n.NextResponse.json({error:"Order not found"},{status:404});let d=await i.w.query(`
      SELECT id, "orderId", "productId", sku, name, quantity, notes
      FROM "OrderItem"
      WHERE "orderId" = $1
      `,[r.id]);return n.NextResponse.json({...u,items:d.rows})}catch(e){if(e?.name==="ZodError")return n.NextResponse.json({error:"Validation failed",details:e.errors?.map(e=>({field:e.path.join("."),message:e.message}))},{status:400});return console.error("Error updating order:",e),n.NextResponse.json({error:"Failed to update order"},{status:400})}}o()}catch(e){o(e)}})},29802:(e,r,t)=>{t.d(r,{$t:()=>d,Ax:()=>a,kF:()=>u});var o=t(30627),n=t(17261);function s(e,r={}){let{requireAuth:t=!0,allowedRoles:o,tokenType:s="user_token"}=r,i=e.cookies.get(s)?.value;if(!i)return null;let a=(0,n.W)(i);return a?o&&o.length>0&&!o.includes(a.role)?null:{username:a.username,role:a.role}:null}function i(e="Forbidden"){return o.NextResponse.json({error:e},{status:403})}function a(e){return s(e,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"})||i("Admin access required")}function u(e){return async r=>{let t=s(r,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"});return t?e(r,t):i("Admin access required")}}function d(e){return async r=>{let t=s(r,{requireAuth:!0,allowedRoles:["customer"],tokenType:"user_token"});return t?e(r,t):function(e="Unauthorized"){return o.NextResponse.json({error:e},{status:401})}("Authentication required")}}},17261:(e,r,t)=>{t.d(r,{R:()=>a,W:()=>u});var o=t(57946),n=t.n(o);let s=process.env.JWT_SECRET||"",i=process.env.JWT_EXPIRES_IN||"7d";if(!s)throw Error("JWT_SECRET environment variable must be set in production");function a(e,r="customer"){if(!s)throw Error("JWT_SECRET is not configured");return n().sign({username:e,role:r},s,{expiresIn:i})}function u(e){try{if(!s)return null;return n().verify(e,s)}catch{return null}}},83136:(e,r,t)=>{t.a(e,async(e,o)=>{try{t.d(r,{w:()=>i});var n=t(8678),s=e([n]);if(n=(s.then?(await s)():s)[0],!process.env.DATABASE_URL)throw Error("DATABASE_URL must be set for Postgres connections");let i=new n.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});o()}catch(e){o(e)}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[6522,8247,7946,6415],()=>t(59029));module.exports=o})();