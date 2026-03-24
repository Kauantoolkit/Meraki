import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';
import { SubmitBidDto } from './dto/submit-bid.dto';

const BIDDING_URL = process.env.BIDDING_SERVICE_URL || 'http://localhost:3003';

@Injectable()
export class BidsService {
  constructor(private readonly proxy: HttpProxyService) {}

  submit(projectId: string, dto: SubmitBidDto, token: string) {
    return this.proxy.post(`${BIDDING_URL}/api/bids`, { ...dto, projectId }, this.proxy.authHeaders(token));
  }

  findByProject(projectId: string, token: string) {
    return this.proxy.get(`${BIDDING_URL}/api/bids?projectId=${projectId}`, this.proxy.authHeaders(token));
  }

  findMyBids(token: string) {
    return this.proxy.get(`${BIDDING_URL}/api/bids/my-bids`, this.proxy.authHeaders(token));
  }

  findOne(id: string, token: string) {
    return this.proxy.get(`${BIDDING_URL}/api/bids/${id}`, this.proxy.authHeaders(token));
  }

  accept(bidId: string, token: string) {
    return this.proxy.put(`${BIDDING_URL}/api/bids/${bidId}/accept`, {}, this.proxy.authHeaders(token));
  }

  reject(bidId: string, token: string) {
    return this.proxy.put(`${BIDDING_URL}/api/bids/${bidId}/reject`, {}, this.proxy.authHeaders(token));
  }

  withdraw(bidId: string, token: string) {
    return this.proxy.put(`${BIDDING_URL}/api/bids/${bidId}/withdraw`, {}, this.proxy.authHeaders(token));
  }
}
