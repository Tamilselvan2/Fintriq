import { OrganizationService } from '../../../src/modules/organization/organization.service';
import { prismaMock } from '../../__mocks__/prisma';
import { Role } from '@prisma/client';

describe('OrganizationService', () => {
  let organizationService: OrganizationService;

  beforeEach(() => {
    organizationService = new OrganizationService();
  });

  describe('getMembers', () => {
    it('should return members restricted by orgId', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: '1', email: 'test@example.com', orgId: 'org1', role: Role.USER } as any
      ]);
      prismaMock.user.count.mockResolvedValue(1);

      const response = await organizationService.getMembers('org1');

      expect(response.data).toHaveLength(1);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orgId: 'org1' }
        })
      );
    });
  });
});
