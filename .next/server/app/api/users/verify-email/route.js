"use strict";(()=>{var e={};e.id=4101,e.ids=[4101],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},8678:e=>{e.exports=import("pg")},59974:(e,i,r)=>{r.a(e,async(e,t)=>{try{r.r(i),r.d(i,{originalPathname:()=>d,patchFetch:()=>u,requestAsyncStorage:()=>p,routeModule:()=>c,serverHooks:()=>f,staticGenerationAsyncStorage:()=>m});var a=r(12085),s=r(31650),n=r(85980),o=r(6920),l=e([o]);o=(l.then?(await l)():l)[0];let c=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/users/verify-email/route",pathname:"/api/users/verify-email",filename:"route",bundlePath:"app/api/users/verify-email/route"},resolvedPagePath:"/home/stark/leiindias/app/api/users/verify-email/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:p,staticGenerationAsyncStorage:m,serverHooks:f}=c,d="/api/users/verify-email/route";function u(){return(0,n.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:m})}t()}catch(e){t(e)}})},6920:(e,i,r)=>{r.a(e,async(e,t)=>{try{r.r(i),r.d(i,{GET:()=>u,POST:()=>c});var a=r(30627),s=r(83136),n=r(84770),o=r.n(n),l=e([s]);async function u(e){try{let{searchParams:i}=new URL(e.url),r=i.get("token");if(!r)return a.NextResponse.json({error:"Verification token is required"},{status:400});let t=await s.w.query(`
      SELECT id, email, "emailVerificationToken", "emailVerificationTokenExpires", "emailVerified"
      FROM "User"
      WHERE "emailVerificationToken" = $1
      LIMIT 1
      `,[r]);if(0===t.rows.length)return a.NextResponse.json({error:"Invalid verification token"},{status:400});let n=t.rows[0];if(n.emailVerified)return a.NextResponse.json({message:"Email is already verified",verified:!0});if(n.emailVerificationTokenExpires&&new Date>new Date(n.emailVerificationTokenExpires))return a.NextResponse.json({error:"Verification token has expired. Please request a new one."},{status:400});return await s.w.query(`
      UPDATE "User"
      SET "emailVerified" = true,
          "emailVerificationToken" = NULL,
          "emailVerificationTokenExpires" = NULL,
          "updatedAt" = NOW()
      WHERE id = $1
      `,[n.id]),a.NextResponse.json({message:"Email verified successfully",verified:!0})}catch(e){return console.error("Email verification error:",e),a.NextResponse.json({error:"Failed to verify email"},{status:500})}}async function c(e){try{let{email:i}=await e.json();if(!i||"string"!=typeof i)return a.NextResponse.json({error:"Email is required"},{status:400});let r=await s.w.query(`
      SELECT id, email, name, "emailVerified"
      FROM "User"
      WHERE email = $1 AND "isActive" = true
      LIMIT 1
      `,[i.toLowerCase().trim()]);if(0===r.rows.length)return a.NextResponse.json({message:"If an account exists with this email, a verification link has been sent."});let t=r.rows[0];if(t.emailVerified)return a.NextResponse.json({message:"Email is already verified"});let n=o().randomBytes(32).toString("hex"),l=new Date;l.setDate(l.getDate()+7),await s.w.query(`
      UPDATE "User"
      SET "emailVerificationToken" = $1,
          "emailVerificationTokenExpires" = $2,
          "updatedAt" = NOW()
      WHERE id = $3
      `,[n,l,t.id]);let u=`${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/verify-email?token=${n}`;return console.log(`Email verification link for ${t.email}: ${u}`),a.NextResponse.json({message:"If an account exists with this email, a verification link has been sent."})}catch(e){return console.error("Resend verification email error:",e),a.NextResponse.json({error:"Failed to resend verification email"},{status:500})}}s=(l.then?(await l)():l)[0],t()}catch(e){t(e)}})},83136:(e,i,r)=>{r.a(e,async(e,t)=>{try{r.d(i,{w:()=>n});var a=r(8678),s=e([a]);if(a=(s.then?(await s)():s)[0],!process.env.DATABASE_URL)throw Error("DATABASE_URL must be set for Postgres connections");let n=new a.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});t()}catch(e){t(e)}})}};var i=require("../../../../webpack-runtime.js");i.C(e);var r=e=>i(i.s=e),t=i.X(0,[6522,8247],()=>r(59974));module.exports=t})();