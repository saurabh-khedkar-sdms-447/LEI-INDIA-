"use strict";(()=>{var e={};e.id=9146,e.ids=[9146],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},91924:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.r(t),r.d(t,{originalPathname:()=>y,patchFetch:()=>d,requestAsyncStorage:()=>p,routeModule:()=>c,serverHooks:()=>l,staticGenerationAsyncStorage:()=>m});var n=r(12085),a=r(31650),s=r(85980),i=r(27960),u=e([i]);i=(u.then?(await u)():u)[0];let c=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/orders/route",pathname:"/api/orders",filename:"route",bundlePath:"app/api/orders/route"},resolvedPagePath:"/home/stark/leiindias/app/api/orders/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:p,staticGenerationAsyncStorage:m,serverHooks:l}=c,y="/api/orders/route";function d(){return(0,s.patchFetch)({serverHooks:l,staticGenerationAsyncStorage:m})}o()}catch(e){o(e)}})},27960:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.r(t),r.d(t,{GET:()=>m,POST:()=>p});var n=r(30627),a=r(6415),s=r(83136),i=r(29802),u=e([s]);s=(u.then?(await u)():u)[0];let d=a.Ry({productId:a.Z_().min(1,"Product ID is required"),sku:a.Z_().min(1,"SKU is required"),name:a.Z_().min(1,"Product name is required"),quantity:a.Rx().int().positive("Quantity must be a positive number"),notes:a.Z_().optional()}),c=a.Ry({companyName:a.Z_().min(2,"Company name must be at least 2 characters").trim(),contactName:a.Z_().min(2,"Contact name must be at least 2 characters").trim(),email:a.Z_().email("Invalid email address").toLowerCase().trim(),phone:a.Z_().min(10,"Phone number must be at least 10 characters").trim(),companyAddress:a.Z_().trim().optional(),items:a.IX(d).min(1,"At least one item is required"),notes:a.Z_().optional(),status:a.Km(["pending","quoted","approved","rejected"]).optional()});a.Ry({status:a.Km(["pending","quoted","approved","rejected"]).optional(),notes:a.Z_().optional()}).refine(e=>Object.keys(e).length>0,{message:"At least one field must be provided for update"});let p=(0,i.$t)(async e=>{try{let t=await e.json(),r=c.parse(t),o=await s.w.connect();try{await o.query("BEGIN");let e=(await o.query(`
        INSERT INTO "Order" (
          "companyName", "contactName", email, phone,
          "companyAddress", notes, status,
          "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id, "companyName", "contactName", email, phone,
                  "companyAddress", notes, status, "createdAt", "updatedAt"
        `,[r.companyName,r.contactName,r.email,r.phone,r.companyAddress??null,r.notes??null,r.status??"pending"])).rows[0],t=[],a=[];r.items.forEach((r,o)=>{let n=7*o;a.push(`($${n+1}, $${n+2}, $${n+3}, $${n+4}, $${n+5}, $${n+6}, $${n+7})`),t.push(e.id,r.productId,r.sku,r.name,r.quantity,r.notes??null,null)});let s=await o.query(`
        INSERT INTO "OrderItem" (
          "orderId", "productId", sku, name, quantity, notes, id
        )
        VALUES ${a.join(", ")}
        RETURNING id, "orderId", "productId", sku, name, quantity, notes
        `,t);return await o.query("COMMIT"),n.NextResponse.json({...e,items:s.rows},{status:201})}catch(e){throw await o.query("ROLLBACK"),e}finally{o.release()}}catch(e){if(e?.name==="ZodError")return n.NextResponse.json({error:"Validation failed",details:e.errors?.map(e=>({field:e.path.join("."),message:e.message}))},{status:400});return console.error("Error creating order:",e),n.NextResponse.json({error:"Failed to create order"},{status:400})}}),m=(0,i.kF)(async e=>{try{let e=await s.w.query(`
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
      GROUP BY o.id
      ORDER BY o."createdAt" DESC
      `);return n.NextResponse.json(e.rows)}catch(e){return console.error("Error fetching orders:",e),n.NextResponse.json({error:"Failed to fetch orders"},{status:500})}});o()}catch(e){o(e)}})},29802:(e,t,r)=>{r.d(t,{$t:()=>d,Ax:()=>i,kF:()=>u});var o=r(30627),n=r(17261);function a(e,t={}){let{requireAuth:r=!0,allowedRoles:o,tokenType:a="user_token"}=t,s=e.cookies.get(a)?.value;if(!s)return null;let i=(0,n.W)(s);return i?o&&o.length>0&&!o.includes(i.role)?null:{username:i.username,role:i.role}:null}function s(e="Forbidden"){return o.NextResponse.json({error:e},{status:403})}function i(e){return a(e,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"})||s("Admin access required")}function u(e){return async t=>{let r=a(t,{requireAuth:!0,allowedRoles:["admin","superadmin"],tokenType:"admin_token"});return r?e(t,r):s("Admin access required")}}function d(e){return async t=>{let r=a(t,{requireAuth:!0,allowedRoles:["customer"],tokenType:"user_token"});return r?e(t,r):function(e="Unauthorized"){return o.NextResponse.json({error:e},{status:401})}("Authentication required")}}},17261:(e,t,r)=>{r.d(t,{R:()=>i,W:()=>u});var o=r(57946),n=r.n(o);let a=process.env.JWT_SECRET||"",s=process.env.JWT_EXPIRES_IN||"7d";if(!a)throw Error("JWT_SECRET environment variable must be set in production");function i(e,t="customer"){if(!a)throw Error("JWT_SECRET is not configured");return n().sign({username:e,role:t},a,{expiresIn:s})}function u(e){try{if(!a)return null;return n().verify(e,a)}catch{return null}}},83136:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.d(t,{w:()=>s});var n=r(8678),a=e([n]);if(n=(a.then?(await a)():a)[0],!process.env.DATABASE_URL)throw Error("DATABASE_URL must be set for Postgres connections");let s=new n.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});o()}catch(e){o(e)}})}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[6522,8247,7946,6415],()=>r(91924));module.exports=o})();