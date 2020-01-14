import { IExecuteFunctions } from "n8n-core";

import {
	IDataObject,
	INodeTypeDescription,
	INodeExecutionData,
	INodeType
} from "n8n-workflow";

import { xentralRequest } from "./GenericFunctions";

function prepareBodyOldApi(body: IDataObject): IDataObject {
	for(const property in body){
		if(typeof body[property] === 'object'){
			if(body[property] === null){
				body[property] = '';
			} else {
				const subBody = body[property] as IDataObject;
				body[property] = prepareBodyOldApi(subBody);
			}
		} else if(typeof body[property] === 'boolean'){
			body[property] = body[property] ? '1' : '0';
		} else if(typeof body[property] === 'number'){
			body[property] = body[property]!.toString();
		}		
	}	
	return body;
}

export class Xentral implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Xentral",
		name: "xentral",
		icon: "file:xentral.png",
		group: ["transform"],
		version: 1,
		description: "Xentral CRM Node",
		defaults: {
			name: "Xentral",
			color: "#42b8c5"
		},
		inputs: ["main"],
		outputs: ["main"],
		credentials: [
			{
				name: "xentral",
				required: true
			}
		],

		properties: [
			// ----------------------------------
			// 				Resources
			// ----------------------------------
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				options: [
					{
						name: "Order",
						value: "order"
					},
					{
						name: "Address",
						value: "address"
					}
				],
				default: "order",
				description: "The resource to operate on."
			},

			// ----------------------------------
			// 				order
			// ----------------------------------
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				displayOptions: {
					show: {
						resource: ["order"]
					}
				},
				options: [
					{
						name: "Create",
						value: "create",
						description: "Create an order"
					},
					{
						name: "Update",
						value: "update",
						description: "Update an order"
					},
					{
						name: "Get",
						value: "get",
						description: "Get data of an order"
					}
				],
				default: "create",
				description: "The operation to perform."
			},

			// ----------------------------------
			//         order:create
			// ----------------------------------
			{
				displayName: "Data",
				name: "data",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["order"]
					}
				},
				default: "",
				required: true,
				description: "Data of the order to create."
			},

			// ----------------------------------
			//         order:update
			// ----------------------------------
			{
				displayName: "Data",
				name: "data",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["order"]
					}
				},
				default: "",
				required: false,
				description: "Data of the order to create."
			},

			// ----------------------------------
			//         order:get
			// ----------------------------------
			{
				displayName: "Data",
				name: "data",
				type: "string",
				displayOptions: {
					show: {
						operation: ["get"],
						resource: ["order"]
					}
				},
				default: "",
				required: false,
				description: "Data of the order to create."
			},

			// ----------------------------------
			//         address
			// ----------------------------------
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				displayOptions: {
					show: {
						resource: ["address"]
					}
				},
				options: [
					{
						name: "Get All",
						value: "getAll",
						description: "Call up the address list"
					},
					{
						name: "Get by ID",
						value: "getById",
						description: "Get individual addresses"
					},
					{
						name: "Create",
						value: "create",
						description: "Create new address"
					},
					{
						name: "Update",
						value: "update",
						description: "Edit address"
					}
				],
				default: "getAll",
				description: "Call up the address list"
			},

			// ----------------------------------
			//         address: getById
			// ----------------------------------
			{
				displayName: "ID",
				name: "id",
				type: "string",
				displayOptions: {
					show: {
						operation: ["getById"],
						resource: ["address"]
					}
				},
				default: 1,
				required: true,
				description: "Address Id"
			},

			// ----------------------------------
			//         address: create
			// ----------------------------------

			{
				displayName: "Type",
				name: "type",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "firma",
				required: true,
				description: "e.g company"
			},
			{
				displayName: "Language",
				name: "language",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "deutsch",
				required: true,
				description: "e.g Deutsch"
			},
			{
				displayName: "Name",
				name: "name",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g Max Muster"
			},
			{
				displayName: "Land",
				name: "land",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g DE"
			},
			{
				displayName: "Address",
				name: "address",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g Musterstrasse 6"
			},
			{
				displayName: "Place",
				name: "place",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g Musterdorf"
			},
			{
				displayName: "Postcode",
				name: "postcode",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g 12345"
			},
			{
				displayName: "Phone",
				name: "phone",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g 0821123456789"
			},
			{
				displayName: "Fax",
				name: "fax",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g 0821123456789"
			},
			{
				displayName: "Email",
				name: "email",
				type: "string",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g info@maxmuellermuster.de"
			},
			{
				displayName: "Project",
				name: "project",
				type: "number",
				displayOptions: {
					show: {
						operation: ["create"],
						resource: ["address"]
					}
				},
				default: "",
				required: true,
				description: "e.g 1"
			},

			// ----------------------------------
			//         address: update
			// ----------------------------------
	{
				displayName: "ID",
				name: "id",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: 1,
				required: true,
				description: "e.g company"
			},
			{
				displayName: "Type",
				name: "type",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "firma",
				required: false,
				description: "e.g company"
			},
			{
				displayName: "Language",
				name: "language",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "deutsch",
				required: false,
				description: "e.g Deutsch"
			},
			{
				displayName: "Name",
				name: "name",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g Max Muster"
			},
			{
				displayName: "Land",
				name: "land",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g DE"
			},
			{
				displayName: "Address",
				name: "address",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g Musterstrasse 6"
			},
			{
				displayName: "Place",
				name: "place",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g Musterdorf"
			},
			{
				displayName: "Postcode",
				name: "postcode",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g 12345"
			},
			{
				displayName: "Phone",
				name: "phone",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g 0821123456789"
			},
			{
				displayName: "Fax",
				name: "fax",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g 0821123456789"
			},
			{
				displayName: "Email",
				name: "email",
				type: "string",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g info@maxmuellermuster.de"
			},
			{
				displayName: "Project",
				name: "project",
				type: "number",
				displayOptions: {
					show: {
						operation: ["update"],
						resource: ["address"]
					}
				},
				default: "",
				required: false,
				description: "e.g 1"
			}
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		let resource: string;
		let operation: string;

		// For Post
		let body: IDataObject;

		let requestMethod: string;
		let endpoint: string;

		for (let i = 0; i < items.length; i++) {
			requestMethod = "GET";
			endpoint = "";
			body = {} as IDataObject;

			resource = this.getNodeParameter("resource", 0) as string;
			operation = this.getNodeParameter("operation", 0) as string;

			if (resource === "order") {
				if (operation === "create") {
					// ----------------------------------
					//         create
					// ----------------------------------
					requestMethod = "POST";
					endpoint = "/api/AuftragCreate";

					body = {
						data: JSON.parse(
							this.getNodeParameter("data", i) as string
						) as object
					} as IDataObject;
				} else if (operation === "update") {
					// ----------------------------------
					//         update
					// ----------------------------------
					requestMethod = "POST";
					endpoint = "/api/AuftragEdit";

					body = {
						data: JSON.parse(
							this.getNodeParameter("data", i) as string
						) as object
					} as IDataObject;
				} else if (operation === "get") {
					// ----------------------------------
					//         get
					// ----------------------------------
					requestMethod = "POST";
					endpoint = "/api/AuftragGet";

					body = {
						data: JSON.parse(
							this.getNodeParameter("data", i) as string
						) as object
					} as IDataObject;
				} else {
					throw new Error(`The operation '${operation}' is not known!`);
				}
			} else if (resource === "address") {
				if (operation === "getAll") {
					requestMethod = "GET";

					endpoint = "/api/v1/adressen";
				} else if (operation === "getById") {
					requestMethod = "GET";

					const id = this.getNodeParameter("id", i) as number;
					endpoint = `/api/v1/adressen/${id}`;
				} else if (operation === "create") {
					requestMethod = "POST";

					body.type = this.getNodeParameter("type", i) as string;
					body.language = this.getNodeParameter("language", i) as string;
					body.name = this.getNodeParameter("name", i) as string;
					body.land = this.getNodeParameter("land", i) as string;
					body.address = this.getNodeParameter("address", i) as string;
					body.place = this.getNodeParameter("place", i) as string;
					body.postcode = this.getNodeParameter("postcode", i) as string;
					body.phone = this.getNodeParameter("phone", i) as string;
					body.fax = this.getNodeParameter("fax", i) as string;
					body.email = this.getNodeParameter("email", i) as string;
					body.project = this.getNodeParameter("project", i) as string;

					endpoint = "/api/v1/adressen";
				} else if (operation === "update") {
					requestMethod = "PUT";

					body.type = this.getNodeParameter("type", i) as string;
					body.language = this.getNodeParameter("language", i) as string;
					body.name = this.getNodeParameter("name", i) as string;
					body.land = this.getNodeParameter("land", i) as string;
					body.address = this.getNodeParameter("address", i) as string;
					body.place = this.getNodeParameter("place", i) as string;
					body.postcode = this.getNodeParameter("postcode", i) as string;
					body.phone = this.getNodeParameter("phone", i) as string;
					body.fax = this.getNodeParameter("fax", i) as string;
					body.email = this.getNodeParameter("email", i) as string;
					body.project = this.getNodeParameter("project", i) as string;

					const id = this.getNodeParameter("id", i) as number;
					endpoint = `/api/v1/adressen/${id}`;
				}
			} else {
				throw new Error(`The resource '${resource}' is not known!`);
			}

			const responseData = await xentralRequest.call(
				this,
				requestMethod,
				endpoint,
				body
			);

			returnData.push(responseData as IDataObject);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
