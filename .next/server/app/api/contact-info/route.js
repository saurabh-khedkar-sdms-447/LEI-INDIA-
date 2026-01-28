"use strict";(()=>{var e={};e.id=9405,e.ids=[9405],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},49239:(e,r,t)=>{t.a(e,async(e,n)=>{try{t.r(r),t.d(r,{originalPathname:()=>g,patchFetch:()=>c,requestAsyncStorage:()=>d,routeModule:()=>l,serverHooks:()=>f,staticGenerationAsyncStorage:()=>p});var o=t(12085),a=t(31650),i=t(85980),s=t(13740),u=e([s]);s=(u.then?(await u)():u)[0];let l=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/contact-info/route",pathname:"/api/contact-info",filename:"route",bundlePath:"app/api/contact-info/route"},resolvedPagePath:"/home/stark/leiindias/app/api/contact-info/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:p,serverHooks:f}=l,g="/api/contact-info/route";function c(){return(0,i.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:p})}n()}catch(e){n(e)}})},13740:(e,r,t)=>{t.a(e,async(e,n)=>{try{t.r(r),t.d(r,{GET:()=>c,PUT:()=>l});var o=t(30627),a=t(83136),i=t(29802),s=e([a]);async function u(){let e=await a.w.query(`
    SELECT id, phone, email, address, "registeredAddress", "factoryLocation2",
           "regionalBangalore", "regionalKolkata", "regionalGurgaon",
           "createdAt", "updatedAt"
    FROM "ContactInfo"
    ORDER BY "createdAt" ASC
    LIMIT 1
    `);return e.rows[0]?e.rows[0]:(await a.w.query(`
    INSERT INTO "ContactInfo" (
      phone, email, address, "registeredAddress", "factoryLocation2",
      "regionalBangalore", "regionalKolkata", "regionalGurgaon",
      "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3, NULL, NULL, NULL, NULL, NULL, NOW(), NOW())
    RETURNING id, phone, email, address, "registeredAddress", "factoryLocation2",
              "regionalBangalore", "regionalKolkata", "regionalGurgaon",
              "createdAt", "updatedAt"
    `,["+91-XXX-XXXX-XXXX","info@leiindias.com","Industrial Area, India"])).rows[0]}async function c(e){try{let e=await u();return o.NextResponse.json(e)}catch(e){return console.error("Failed to fetch contact information:",e),o.NextResponse.json({error:"Failed to fetch contact information"},{status:500})}}async function l(e){try{let r=(0,i.Ax)(e);if(r instanceof o.NextResponse)return r;let{phone:t,email:n,address:s,registeredAddress:c,factoryLocation2:l,regionalContacts:d}=await e.json();if(!t||!n||!s)return o.NextResponse.json({error:"Phone, email, and address are required"},{status:400});let p=await u(),f=await a.w.query(`
      UPDATE "ContactInfo"
      SET
        phone = $1,
        email = $2,
        address = $3,
        "registeredAddress" = $4,
        "factoryLocation2" = $5,
        "regionalBangalore" = $6,
        "regionalKolkata" = $7,
        "regionalGurgaon" = $8,
        "updatedAt" = NOW()
      WHERE id = $9
      RETURNING id, phone, email, address, "registeredAddress", "factoryLocation2",
                "regionalBangalore", "regionalKolkata", "regionalGurgaon",
                "createdAt", "updatedAt"
      `,[t,n,s,c??null,l??null,d?.bangalore??null,d?.kolkata??null,d?.gurgaon??null,p.id]);return o.NextResponse.json(f.rows[0])}catch(e){return console.error("Failed to update contact information:",e),o.NextResponse.json({error:"Failed to update contact information"},{status:500})}}a=(s.then?(await s)():s)[0],n()}catch(e){n(e)}})},29802:(e,r,t)=>{t.d(r,{$t:()=>c,Ax:()=>s,kF:()=>u});var n=t(30627),o=t(17261);function a(e,r={}){let{requireAuth:t=!0,allowedRoles:n,tokenType:a="user_token"}=r,i=e.cookies.get(a)?.value;if(!i)return null;let s=(0,o.W)(i);return s?n&&n.length>0&&!n.includes(s.role)?null:{username:s.username,role:s.role}:null}function i(e="Forbidden"){return n.NextResponse.json({error:e},{status:403})}function s(e){return a(e,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"})||i("Admin access required")}function u(e){return async r=>{let t=a(r,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"});return t?e(r,t):i("Admin access required")}}function c(e){return async r=>{let t=a(r,{requireAuth:!0,allowedRoles:["customer"],tokenType:"user_token"});return t?e(r,t):function(e="Unauthorized"){return n.NextResponse.json({error:e},{status:401})}("Authentication required")}}},17261:(e,r,t)=>{t.d(r,{R:()=>s,W:()=>u});var n=t(57946),o=t.n(n);let a=process.env.JWT_SECRET||"",i=process.env.JWT_EXPIRES_IN||"7d";if(!a)throw Error("JWT_SECRET environment variable must be set in production");function s(e,r="customer"){if(!a)throw Error("JWT_SECRET is not configured");return o().sign({username:e,role:r},a,{expiresIn:i})}function u(e){try{if(!a)return null;return o().verify(e,a)}catch{return null}}},83136:(e,r,t)=>{t.a(e,async(e,n)=>{try{t.d(r,{w:()=>i});var o=t(8678),a=e([o]);if(o=(a.then?(await a)():a)[0],!process.env.DATABASE_URL)throw Error("DATABASE_URL must be set for Postgres connections");let i=new o.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});n()}catch(e){n(e)}})}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[6522,8247,7946],()=>t(49239));module.exports=n})();