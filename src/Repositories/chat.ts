import {db_client} from "../core/database";
import {CreateGroup, CreateMessage, UpdateChat, UpdateMessage} from "../schemas/chat";

export class Chat{

    static async create_group(user_id: string, data: CreateGroup){
        let chat = await db_client.chat.create({
        data: {
            is_group: true,
            participants: {
                connect: {
                    id: user_id
                }
            },
            group: {
                create: {
                    name: data.name,
                    creator_id: user_id,
                    type: data.type,
                    description: data.description
                }
            }
        },
    })
        if (data.participant_ids && data.participant_ids.length > 0){
            await this.update(chat.id, user_id, {participant_ids: data.participant_ids,
        description: undefined})
        }
        return chat
    }

    static async create_chat(user_id: string, recipient_id: string){
        return db_client.chat.create({
            data: {
                is_group: false,
                participant_ids: [user_id, recipient_id]
            },
        });
    }


    static async retrieve(id:string, user_id:string){
        return db_client.chat.findFirst({
            where: {
                AND: [{id: id}, {participant_ids: {has: user_id}}]
            }, select: {
                id: true,
                is_group: true,
                participants: {
                    where: {
                        id: {
                            not: user_id
                        }
                    },
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        user_id:true,
                        profile_pic: true,
                        role: true
                    }
                },
                created_at: true,
                messages: {
                     orderBy: {
                        updated_at: "desc"
                    }, take: 1
                },
                group: true,

            }
        });
    }

    static  async list(user_id:string, page:number|null=1, page_size:number|null=10){
        let skip = page && page_size ? page_size * (page - 1) : undefined
        return db_client.chat.findMany(
            {
                where: {
                    participant_ids: {has: user_id}
                }, select: {
                    id: true,
                    is_group: true,
                    participants: {
                        where: {
                            id: {
                                not: user_id
                            }
                        },
                        select: {
                            id: true,
                            first_name: true,
                            user_id: true,
                            last_name: true,
                            profile_pic: true,
                            role: true
                        }
                    },
                    created_at: true,
                    messages: {
                        orderBy: {
                            updated_at: "desc"
                        }, take: 1
                    },
                    group: true,
                },
                skip: skip ? skip : undefined,
                take: page_size ? page_size : undefined
            }
        );

    }

    static async update(id:string, user_id: string, data: UpdateChat) {
        let query;

        if (data.participant_ids) {
            query = {
                where: {
                    participant_ids: {
                        has: user_id,
                    },
                    id: id
                },
                data: {participant_ids: data.participant_ids}
            }
            await db_client.chat.update(query)
        }
        if (data.description) {
            query = {
                where: {
                    participant_ids: {
                        has: user_id,
                    },
                    id: id
                },
                data: {
                    group: {
                        update: {
                            description: data.description
                        }
                    }
                }
            }
            await db_client.chat.update(query)
        }
        return query
    }

    static async delete(id:string, user_id:string){
        let group;
        group = db_client.group.findFirst({
            where: {
                chat_id: id,
                creator_id: user_id
            },
            take: 1
        })
        if (!group){
            return null
        }
        return db_client.chat.delete({
            where: {
                id: id
            },
        });
    }

    static async participants(id:string){
        const participants = await db_client.chat.findFirst({
            where:{
                id: id
            },
            select:{
                participants: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        user_id: true,
                        email:true,
                    }
                }
            }
        })
        console.log(participants)
        return participants
    }

}


export class Message {

    static async list(chat_id: string, user_id: string, page: number | null = 1, page_size: number | null = 10) {
        let skip = page && page_size ? page_size * (page - 1) : undefined
        return db_client.message.findMany({
            where: {
                chat_id: chat_id,
                chat: {
                    participant_ids: {
                        has: user_id
                    }
                }
            },
            include: {
                attachments: {
                    select: {
                        id: true,
                        file_type: true,
                        file: true
                    },
                }
            },
            skip: skip ? skip : undefined,
            take: page_size ? page_size : undefined
        })
    }


    static async create(chat_id: string, user_id: string, data: CreateMessage) {
        let message = await db_client.message.create({
            data: {
                chat_id: chat_id,
                content: data.content,
                sender_id: user_id
            },
        });

        if (data.attachments && data.attachments.length > 0) {
            let attachments = data.attachments?.map((item) => ({...item, message_id: message.id}))
            await db_client.attachment.createMany({
                data: attachments
            })
        }

        return message
    }


    static async update(id: string, user_id: string, data: UpdateMessage) {
        // @ts-ignore
        await db_client.message.update({
            where: {
                id: id,
                chat: {
                    participant_ids: {
                        has: user_id
                    }
                }
            },
            data: {...data}
        })
    }

    static async delete(id: string, user_id: string) {
        return db_client.message.delete({
            where: {
                id: id,
                sender_id: user_id
            },

        });
    }

    static async deleteAttachments(user_id: string, attachment_ids: string[]) {
        return db_client.attachment.deleteMany({
            where: {
                message:
                    {
                        sender_id: user_id
                    },
                id: {
                    in: attachment_ids
                }
            }
        });
    }
}
