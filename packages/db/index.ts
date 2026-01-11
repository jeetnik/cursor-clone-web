import {PrismaPg} from  "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"

const adapter=new PrismaPg({
    connectionString:process.env.DATABASE_URL||"postgres://postgres:password@localhost:5432/postgres"
})

const prisma=new PrismaClient({adapter:adapter});

export default prisma;