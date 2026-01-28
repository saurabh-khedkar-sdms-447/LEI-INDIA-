"use strict";(()=>{var e={};e.id=3898,e.ids=[3898],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:e=>{e.exports=import("pg")},96928:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>p,requestAsyncStorage:()=>d,routeModule:()=>u,serverHooks:()=>g,staticGenerationAsyncStorage:()=>l});var a=r(12085),n=r(31650),o=r(85980),s=r(62192),c=e([s]);s=(c.then?(await c)():c)[0];let u=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/products/[id]/route",pathname:"/api/products/[id]",filename:"route",bundlePath:"app/api/products/[id]/route"},resolvedPagePath:"/home/stark/leiindias/app/api/products/[id]/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:l,serverHooks:g}=u,m="/api/products/[id]/route";function p(){return(0,o.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:l})}i()}catch(e){i(e)}})},62192:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{DELETE:()=>u,GET:()=>c,PUT:()=>p});var a=r(30627),n=r(83136),o=r(49770),s=e([n]);async function c(e,{params:t}){try{let e=(await n.w.query(`
      SELECT
        id, sku, name, category, description, "technicalDescription", coding, pins,
        "ipRating", gender, "connectorType", material, voltage, current,
        "temperatureRange", "wireGauge", "cableLength", price, "priceType",
        "inStock", "stockQuantity", images, "datasheetUrl",
        "createdAt", "updatedAt"
      FROM "Product"
      WHERE id = $1
      LIMIT 1
      `,[t.id])).rows[0];if(!e)return a.NextResponse.json({error:"Product not found"},{status:404});return a.NextResponse.json(e)}catch(e){return console.error("Error fetching product:",e),a.NextResponse.json({error:"Failed to fetch product"},{status:500})}}async function p(e,{params:t}){try{let r=await e.json(),i=o.r.parse(r),s=(await n.w.query(`
      SELECT
        id, sku, name, category, description, "technicalDescription", coding, pins,
        "ipRating", gender, "connectorType", material, voltage, current,
        "temperatureRange", "wireGauge", "cableLength", price, "priceType",
        "inStock", "stockQuantity", images, "datasheetUrl"
      FROM "Product"
      WHERE id = $1
      LIMIT 1
      `,[t.id])).rows[0];if(!s)return a.NextResponse.json({error:"Product not found"},{status:404});let c=await n.w.query(`
      UPDATE "Product"
      SET
        sku = $1,
        name = $2,
        category = $3,
        description = $4,
        "technicalDescription" = $5,
        coding = $6,
        pins = $7,
        "ipRating" = $8,
        gender = $9,
        "connectorType" = $10,
        material = $11,
        voltage = $12,
        current = $13,
        "temperatureRange" = $14,
        "wireGauge" = $15,
        "cableLength" = $16,
        price = $17,
        "priceType" = $18,
        "inStock" = $19,
        "stockQuantity" = $20,
        images = $21,
        "datasheetUrl" = $22,
        "updatedAt" = NOW()
      WHERE id = $23
      RETURNING
        id, sku, name, category, description, "technicalDescription", coding, pins,
        "ipRating", gender, "connectorType", material, voltage, current,
        "temperatureRange", "wireGauge", "cableLength", price, "priceType",
        "inStock", "stockQuantity", images, "datasheetUrl",
        "createdAt", "updatedAt"
      `,[i.sku??s.sku,i.name??s.name,i.category??s.category,i.description??s.description,i.technicalDescription??s.technicalDescription,i.coding??s.coding,i.pins??s.pins,i.ipRating??s.ipRating,i.gender??s.gender,i.connectorType??s.connectorType,i.specifications?.material??s.material,i.specifications?.voltage??s.voltage,i.specifications?.current??s.current,i.specifications?.temperatureRange??s.temperatureRange,i.specifications&&"wireGauge"in i.specifications?i.specifications.wireGauge:s.wireGauge,i.specifications&&"cableLength"in i.specifications?i.specifications.cableLength:s.cableLength,i.price??s.price,i.priceType??s.priceType,i.inStock??s.inStock,i.stockQuantity??s.stockQuantity,i.images??s.images,void 0!==i.datasheetUrl?i.datasheetUrl||null:s.datasheetUrl,t.id]);return a.NextResponse.json(c.rows[0])}catch(e){if(e?.name==="ZodError")return a.NextResponse.json({error:"Validation failed",details:e.errors?.map(e=>({field:e.path.join("."),message:e.message}))},{status:400});return console.error("Error updating product:",e),a.NextResponse.json({error:"Failed to update product"},{status:400})}}async function u(e,{params:t}){try{if(!(await n.w.query(`
      SELECT id
      FROM "Product"
      WHERE id = $1
      LIMIT 1
      `,[t.id])).rows[0])return a.NextResponse.json({error:"Product not found"},{status:404});return await n.w.query(`
      DELETE FROM "Product"
      WHERE id = $1
      `,[t.id]),a.NextResponse.json({message:"Product deleted successfully"})}catch(e){return console.error("Error deleting product:",e),a.NextResponse.json({error:"Failed to delete product"},{status:500})}}n=(s.then?(await s)():s)[0],i()}catch(e){i(e)}})},83136:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.d(t,{w:()=>o});var a=r(8678),n=e([a]);if(a=(n.then?(await n)():n)[0],!process.env.DATABASE_URL)throw Error("DATABASE_URL must be set for Postgres connections");let o=new a.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1}});i()}catch(e){i(e)}})},49770:(e,t,r)=>{r.d(t,{I:()=>a,r:()=>n});var i=r(6415);let a=i.Ry({sku:i.Z_().min(1,"SKU is required").trim(),name:i.Z_().min(1,"Product name is required").trim(),category:i.Z_().min(1,"Category is required").trim(),description:i.Z_().min(1,"Description is required"),technicalDescription:i.Z_().min(1,"Technical description is required"),coding:i.Km(["A","B","D","X"],{errorMap:()=>({message:"Coding must be A, B, D, or X"})}),pins:i.G0([i.i0(3),i.i0(4),i.i0(5),i.i0(8),i.i0(12)],{errorMap:()=>({message:"Pins must be 3, 4, 5, 8, or 12"})}),ipRating:i.Km(["IP67","IP68","IP20"],{errorMap:()=>({message:"IP Rating must be IP67, IP68, or IP20"})}),gender:i.Km(["Male","Female"],{errorMap:()=>({message:"Gender must be Male or Female"})}),connectorType:i.Km(["M12","M8","RJ45"],{errorMap:()=>({message:"Connector type must be M12, M8, or RJ45"})}),specifications:i.Ry({material:i.Z_().min(1,"Material is required"),voltage:i.Z_().min(1,"Voltage is required"),current:i.Z_().min(1,"Current is required"),temperatureRange:i.Z_().min(1,"Temperature range is required"),wireGauge:i.Z_().optional(),cableLength:i.Z_().optional()}),price:i.Rx().positive().optional(),priceType:i.Km(["fixed","quote"]).default("quote"),inStock:i.O7().default(!0),stockQuantity:i.Rx().int().positive().optional(),images:i.IX(i.Z_()).default([]),datasheetUrl:i.Z_().url().optional().or(i.i0("")),relatedProducts:i.IX(i.Z_()).optional()}),n=a.partial()}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[6522,8247,6415],()=>r(96928));module.exports=i})();