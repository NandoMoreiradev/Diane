import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter, interval, map, merge } from 'rxjs';

export interface OrderEventPayload {
  type: 'order.created' | 'order.updated';
  order: any;
}

@Injectable()
export class EventsService {
  private readonly subject = new Subject<OrderEventPayload>();

  emit(payload: OrderEventPayload) {
    this.subject.next(payload);
  }

  boardStream(): Observable<MessageEvent> {
    const events$ = this.subject.asObservable().pipe(
      map((payload): MessageEvent => ({
        type: payload.type,
        data: payload.order,
      })),
    );
    const heartbeat$ = interval(25000).pipe(
      map((): MessageEvent => ({ type: 'ping', data: { ts: Date.now() } })),
    );
    return merge(events$, heartbeat$);
  }

  orderStream(orderId: string): Observable<MessageEvent> {
    const events$ = this.subject.asObservable().pipe(
      filter((payload) => payload.order?.id === orderId),
      map((payload): MessageEvent => {
        const o = payload.order;
        return {
          type: payload.type,
          data: {
            id: o.id,
            codigo: o.codigo,
            canal: o.canal,
            mesa: o.mesa,
            status: o.status,
            subtotal: o.subtotal,
            frete: o.frete,
            total: o.total,
            criadoEm: o.criadoEm,
            itens: Array.isArray(o.itens)
              ? o.itens.map((i: { id: string; nome: string; q: number; preco: number; sabor: string | null }) => ({
                  id: i.id,
                  nome: i.nome,
                  q: i.q,
                  preco: i.preco,
                  sabor: i.sabor,
                }))
              : [],
          },
        };
      }),
    );
    const heartbeat$ = interval(25000).pipe(
      map((): MessageEvent => ({ type: 'ping', data: { ts: Date.now() } })),
    );
    return merge(events$, heartbeat$);
  }
}
