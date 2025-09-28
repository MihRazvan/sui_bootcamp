module guestbook::guestbook;

public struct Message has store, drop{
    content: vector <u8>,
    author: address,
}

public struct GuestBook has key {
    id :UID,
    messages: vector<Message>,
    no_of_messages: u64,
}

const MAX_LENGTH: u64 = 300;

fun init(ctx: &mut TxContext) {
    let guestbook: GuestBook = GuestBook {
        id: object::new(ctx),
        messages: vector::empty<Message>(),
        no_of_messages: 0,
    };

    sui::transfer::share_object(guestbook);
}

public fun post_message(message: Message, guestbook: &mut GuestBook) {

}

public fun create_message(content: vector<u8>, ctx: &mut TxContext): Message {
    assert!(content.length() < MAX_LENGTH, 1);
    let sender: address = ctx.sender();
    Message {
        content,
        author: sender
    }
}