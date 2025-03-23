import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AdminInitializerService } from './init/admin-initializer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [AdminInitializerService],
  exports: []
})
export class CommonModule {}