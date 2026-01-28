"use strict";(()=>{var e={};e.id=4831,e.ids=[4831],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},33299:(e,r,t)=>{t.a(e,async(e,n)=>{try{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>d,requestAsyncStorage:()=>l,routeModule:()=>c,serverHooks:()=>g,staticGenerationAsyncStorage:()=>p});var o=t(12085),s=t(31650),a=t(85980),i=t(66060),u=e([i]);i=(u.then?(await u)():u)[0];let c=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/categories/[id]/route",pathname:"/api/categories/[id]",filename:"route",bundlePath:"app/api/categories/[id]/route"},resolvedPagePath:"/home/stark/leiindias/app/api/categories/[id]/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:l,staticGenerationAsyncStorage:p,serverHooks:g}=c,m="/api/categories/[id]/route";function d(){return(0,a.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:p})}n()}catch(e){n(e)}})},66060:(e,r,t)=>{t.a(e,async(e,n)=>{try{t.r(r),t.d(r,{DELETE:()=>l,GET:()=>d,PUT:()=>c});var o=t(30627),s=t(83136),a=t(17494),i=t(29802),u=e([s]);async function d(e,{params:r}){try{let e=(await s.w.query(`
      SELECT id, name, slug, description, image, "parentId", "createdAt", "updatedAt"
      FROM "Category"
      WHERE id = $1
      LIMIT 1
      `,[r.id])).rows[0];if(!e)return o.NextResponse.json({error:"Category not found"},{status:404});return o.NextResponse.json(e)}catch(e){return console.error("Error fetching category:",e),o.NextResponse.json({error:"Failed to fetch category"},{status:500})}}async function c(e,{params:r}){try{let t=(0,i.Ax)(e);if(t instanceof o.NextResponse)return t;let n=await e.json(),u=a.C.parse(n),d=(await s.w.query(`
      SELECT id, name, slug, description, image, "parentId"
      FROM "Category"
      WHERE id = $1
      LIMIT 1
      `,[r.id])).rows[0];if(!d)return o.NextResponse.json({error:"Category not found"},{status:404});let c=await s.w.query(`
      UPDATE "Category"
      SET
        name = $1,
        slug = $2,
        description = $3,
        image = $4,
        "parentId" = $5,
        "updatedAt" = NOW()
      WHERE id = $6
      RETURNING id, name, slug, description, image, "parentId", "createdAt", "updatedAt"
      `,[u.name??d.name,u.slug??d.slug,void 0!==u.description?u.description||null:d.description,void 0!==u.image?u.image||null:d.image,void 0!==u.parentId?u.parentId||null:d.parentId,r.id]);return o.NextResponse.json(c.rows[0])}catch(e){if(e?.name==="ZodError")return o.NextResponse.json({error:"Validation failed",details:e.errors?.map(e=>({field:e.path.join("."),message:e.message}))},{status:400});return console.error("Error updating category:",e),o.NextResponse.json({error:"Failed to update category"},{status:400})}}async function l(e,{params:r}){try{let t=(0,i.Ax)(e);if(t instanceof o.NextResponse)return t;if(!(await s.w.query(`
      SELECT id
      FROM "Category"
      WHERE id = $1
      LIMIT 1
      `,[r.id])).rows[0])return o.NextResponse.json({error:"Category not found"},{status:404});return await s.w.query(`
      DELETE FROM "Category"
      WHERE id = $1
      `,[r.id]),o.NextResponse.json({message:"Category deleted successfully"})}catch(e){return console.error("Error deleting category:",e),o.NextResponse.json({error:"Failed to delete category"},{status:500})}}s=(u.then?(await u)():u)[0],n()}catch(e){n(e)}})},29802:(e,r,t)=>{t.d(r,{$t:()=>d,Ax:()=>i,kF:()=>u});var n=t(30627),o=t(17261);function s(e,r={}){let{requireAuth:t=!0,allowedRoles:n,tokenType:s="user_token"}=r,a=e.cookies.get(s)?.value;if(!a)return null;let i=(0,o.W)(a);return i?n&&n.length>0&&!n.includes(i.role)?null:{username:i.username,role:i.role}:null}function a(e="Forbidden"){return n.NextResponse.json({error:e},{status:403})}function i(e){return s(e,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"})||a("Admin access required")}function u(e){return async r=>{let t=s(r,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"});return t?e(r,t):a("Admin access required")}}function d(e){return async r=>{let t=s(r,{requireAuth:!0,allowedRoles:["customer"],tokenType:"user_token"});return t?e(r,t):function(e="Unauthorized"){return n.NextResponse.json({error:e},{status:401})}("Authentication required")}}},17494:(e,r,t)=>{t.d(r,{$:()=>o,C:()=>s});var n=t(6415);let o=n.Ry({name:n.Z_().min(1,"Category name is required").trim(),slug:n.Z_().min(1,"Slug is required").regex(/^[a-z0-9-]+$/,{message:"Slug must contain only lowercase letters, numbers, and hyphens"}).trim(),description:n.Z_().optional(),image:n.Z_().url().optional().or(n.i0("")),parentId:n.Z_().optional()}),s=o.partial()},17261:(e,r,t)=>{t.d(r,{R:()=>i,W:()=>u});var n=t(57946),o=t.n(n);let s=process.env.JWT_SECRET||"",a=process.env.JWT_EXPIRES_IN||"7d";if(!s)throw Error("JWT_SECRET environment variable must be set in production");function i(e,r="customer"){if(!s)throw Error("JWT_SECRET is not configured");return o().sign({username:e,role:r},s,{expiresIn:a})}function u(e){try{if(!s)return null;return o().verify(e,s)}catch{return null}}},83136:(e,r,t)=>{t.a(e,async(e,n)=>{try{t.d(r,{w:()=>a});var o=t(8678),s=e([o]);if(o=(s.then?(await s)():s)[0],!process.env.DATABASE_URL)throw Error("DATABASE_URL must be set for Postgres connections");let a=new o.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});n()}catch(e){n(e)}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[6522,8247,7946,6415],()=>t(33299));module.exports=n})();