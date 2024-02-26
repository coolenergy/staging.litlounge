### Overview

xCams is a live stream platform with nodejs for BE, react js for FE, ant media as media stream server.

Struture
- `api`: provides application restful apis, and manage application business
- `user`: the website for end user, model, studio to acccess
- `admin`: the management website for administrator

### Author
- Sales: contact@adent.io
- Technical: tuong.tran@outlook.com

## Setup

### API
1. Go to api folder, create .env file from `config-example > api.env`
2. Replace with our configuration
3. Run `yarn` to install dependecies. Your `NODE_ENV` should be empty to `development` to install both dependencies and devDependencies
4. Run `yarn start:dev` for dev env or `yarn build && yarn start` from prod env

### User
1. Go to user folder, create .env file from `config-example > user.env`
2. Replace with our configuration
3. Run `yarn` to install dependecies. Your `NODE_ENV` should be empty to `development` to install both dependencies and devDependencies
4. Run `yarn dev` for dev env or `yarn build && yarn start` from prod env

### Admin
1. Go to admin folder, create .env file from `config-example > admin.env`
2. Replace with our configuration
3. Run `yarn` to install dependecies. Your `NODE_ENV` should be empty to `development` to install both dependencies and devDependencies
4. Run `yarn dev` for dev env or `yarn build && yarn start` from prod env
## Change logs

v3.0.9
XCAM-670	[Admin- performers- action - update] Remove the visible API links for doc upload. 
XCAM-584	[Technical] Admin settings - use separate component instead of in mixed type
XCAM-955	Show error ''wait for the admin approval'' when user tries to login but needs admin approval
XCAM-954	[Admin] Edit menu option
XCAM-950	[FE] - Contact page
XCAM-949	[FE] ‚Äì Categories on top menu to be organized in multiple columns instead of one column
XCAM-948	 [Model] ‚Äì Clicking on tokens earned on top bar should go to payout request page
XCAM-946	[Admin] Add 'new password' option Twice instead of once when resetting admin password
XCAM-944	[DEMO] Make the first two rows of models 'Live'
XCAM-542	Token count when a model receives a private chat request.
XCAM-974	Category dropdown overlay blocked performer thumb in performer grid
XCAM-956	[Admin][User| Model | Studio] Password reset field is accepting random inputs.
XCAM-851	Screen freezes after transmission
XCAM-762	[Model-Group chat] The total number of tokens [top right] is not updating during live streaming. /Need to refresh 

v3.0.8
XCAM-634	Support render email subject with custom parameters
XCAM-938	[Streaming tokens] Replace comma with decimals
XCAM-932	Don't show Commas with token nos. instead show decimal only  
XCAM-918	Transaction page revamp for both Admin and Model
XCAM-750	[''User''-''group chat''-''Join conversation''] Please change the error displayed, when user clicks ''join conversation'' and model is not in group chat. 
XCAM-506	[Technical] Create bash script for installation
XCAM-959	user is able to send tip when model is offline 
XCAM-953	Tipping button do nothing if user do not join the conversation
XCAM-952	[Performer profile page] when model leave room, player is removed in user end
XCAM-942	[User dashboard] Issue with video thumbnails while playing video.
XCAM-934	[User] Missing messages when load more messages
XCAM-906	3. [Private chat] Issues related to broadcast, and picture-in-picture options 
XCAM-896	[Messenger] Fix the text area.
XCAM-726	[User/Model Messages] After hitting enter in chat box, the cursor changes to ''No symbol'' for a second. 
XCAM-720	[Model-Profile Image] The image upload is improper. / Need to refresh
XCAM-714	[Model-Create new Video] Uploading more than 200 Mb Video, should throw an error with a message.  
XCAM-589	[Technical] Fix Css - Conflicting order between

v3.0.7
XCAM-930	[Technical] Load env config dynamically for FE
XCAM-923	Add rejectUnauthorized for mail SMTP
XCAM-900	WebRTC play video - handle ended event listener 
XCAM-898	[Admin] Add user URL to admin panel
XCAM-872	Move meta keyword and description settings to home page instead _document
XCAM-871	Header - Hide Category menu if there is no categories
XCAM-855	Add 404 error page
XCAM-854	Fix build without running API server
XCAM-825	Remove import * as React from 'react';
XCAM-816	Performer schema - remove index for avatar id, document verificaiton id, documentVerificationId, releaseFormId
XCAM-797	[Technical] Remove payment information, bitpay, paxum... from performer profile
XCAM-925	token count should not be negative https://prnt.sc/1wulal3
XCAM-911	Fix Typo 
XCAM-905	[Tip] Show default token as 20.
XCAM-902	4. MOBILE UI 
XCAM-888	Host country flag to server
XCAM-873	1. [Group chat] Show username while chat in the 'group chat' session.
XCAM-865	[Admin] Footer orderings are not proper on FE. 
XCAM-859	2. [Mobile] audio issues during group chat. 
XCAM-749	[Model dashboard-video stream] There no option for 'maximize' and 'picture in video' during streaming
XCAM-713	[User-My favorites] Clicking on favorite models, ask to like again for the same models on video streaming page. 
XCAM-638	Cookie policy option
XCAM-482	Recaptcha option
XCAM-939	[USER dashboard] All user Chat texts are aligned to the left during a private chat after 2-3 minutes of chatting
XCAM-935	[User] Content not visible in account panel
XCAM-931	[Admin] Search performer payout request
XCAM-926	Issue with the complete payout on  models account . 
XCAM-924	Page navigation dropdown option is not functional 
XCAM-904	5. [Group/LIVE chat] Messages not appear in the chat box once sent in group/private chat. 
XCAM-901	[Model] Refreshing page while streaming....asks for the 'start publishing' option. 
XCAM-894	'Preview' is not functional while clicking the floating prompt message
XCAM-891	[User] 404 error while opening purchased gallery option  
XCAM-890	[User] Tipping token is incorrect
XCAM-889	[Admin] Show 404 once editor setting contain media
XCAM-793	Admin fevicon shouldn't change 
XCAM-781	[User-funds/tokens] Unable to see the description and the sale name, When I've created 'token packages' through admin. 
XCAM-766	[Admin] The delivery column is empty.
XCAM-548	Fix memory leak warning component unmount for BaseLayout

v3.0.6
XCAM-888	Host country flag to server
XCAM-887	Group call page show 404
XCAM-886	Chat tabs flicker
XCAM-885	Fix Email template syntax
XCAM-884	Stream time is not calculated
XCAM-883	Overflow in header menu is not properly
XCAM-882	Notify publish timeout error once publishing
XCAM-881	Display black screen in live subscriber
XCAM-880	Optimize live publisher
XCAM-879	Improve WebRTC adapter
XCAM-878	Video group call navigate with WebRTC option throws error

v3.0.5
XCAM-828	[Web] Browser redirect to homepage when model left group call
XCAM-819	Remove Conversion Rate step
XCAM-817	Rename memberpayload to send-tip-payload
XCAM-815	Update antd columnsType for table
XCAM-803	Move env to next.config.js for FE and Admin
XCAM-795	[Technical] Remove _id menus from settings
XCAM-869	[Studio][Models] Changing the status of a model, changes the status of the other models too.
XCAM-868	[Admin] List studios shows blank page/ need to refresh.
XCAM-867	Add a download link, in an email, once we purchase digital item.
XCAM-866	[Admin] Uploading digital item asking for stock numbers.
XCAM-863	Technical pop-up messages are not useful to the users. 
XCAM-861	[Mobile][Private chat] Clicking live screen, goes to the end of the chat box.
XCAM-858	[Private chat] Control bars are out of live screen/ showing long hours.
XCAM-829	[Welcome page ] Change the message. 
XCAM-818	Spelling correction
XCAM-752	[Model-Earnings] Comma used in place of decimals 
XCAM-747	['Mobile view'-Model-Orders] Need to scroll[left/right] to see the orders.  The column is very wide to see.
XCAM-724	[Model-Account settings-Documents] Doc. upload issue
XCAM-719	[User-My orders-Actions] The download icon is very small. 
XCAM-665	[Admin - Users] There is a design glitch in balance column [Top left]. 
XCAM-860	[Live streaming] Model hearing her own sound / Voice lagging 10 sec.
XCAM-833	[Web]  Model Live Page - the player shows black screen in mobile device
XCAM-832	[Private chat][Mobile] Unable to accept the incoming private request / Error messages popping up.  
XCAM-830	[Live chat][User] It starts with an error message on computer.  
XCAM-824	Admin - account settings - cannot change email
XCAM-812	[User] Gallery showing 404 error. 
XCAM-809	Payment issues[no messages for the successful transaction / transaction history is empty.] 
XCAM-806	Create performer admin not avatar
XCAM-805	Gird performer > 36 not pagination 
XCAM-804	[Admin-studio] Studio list displays wrong models. 
XCAM-799	[Mobile] Private call ends up with 2 error messages.
XCAM-798	[Mobile issues][Group chat/ Live chat] Model unable to hear  the users sound. / Also shows below error while opening live chat in beginning  
XCAM-796	[Technical] Menu internal and external is being handled incorrectly
XCAM-794	[Admin] Fix this ''is new tab ?'' option, not working. 
XCAM-789	[Admin] Please remove this banner option
XCAM-784	[Model-Products] Clicking product ''Name'' is going to the home page, rather than the 'product update' page. 
XCAM-783	[Model- account settings] Please change the error message shown while deactivating the account .  
XCAM-778	[Admin-Statistic] The list of active and inactive performers showing incorrect values.  
XCAM-770	[Messages] The message box is not responsive for the sent or received messages. 
XCAM-764	[Admin] Earning type is missing
XCAM-757	[User dashboard] Error message is received before initiating live streaming 
XCAM-753	[Admin] [Breadcrumbs] Home page option don't work
XCAM-751	[Admin-Model Earning] The conversion rate is changed to 0, but still showing '1'. 
XCAM-743	['Mobile view'-user/model-message option]   There is a design glitch in the chat box. 
XCAM-738	[Admin-List studios-Total Models-Studio] Studio name is missing for each models. 
XCAM-736	[Studio-Account settings] The upload doc. shows error while downloading
XCAM-705	[Model/User-group chat-live stream] Can't stream models/User videos/one cant view the video of other.
XCAM-684	[User/Model- Messenger] Text is sent after clicking but not visible in the chat box. Need to scroll.  

v3.0.4

XCAM-727	[User-Send tip] The 'Custom amount' is set to '-1'. 
XCAM-699	[Model dashboard] Tip incoming message stuck on the top for some minutes. 
XCAM-698	[User homepage - Filter option[top left corner]] Dropdown should automatically be wrapped, once the other dropdown is opened.   
XCAM-697	[User-My Orders] There is no pending status included under the 'status' dropdown. 
XCAM-695	[Admin-User-Change password] Change password error message is incorrect 'Please input your password!'. 
XCAM-693	[User/Model] Password reveal eye icon is missing on user/model dashboard while login. 
XCAM-691	[User-Funds/tokens] CCBill page should open in the next page once 'Buy now' is clicked. 
XCAM-688	[User/Model-Messenger] There is a thin black line visible at the end of the text box. [once we start writing something in chat box]
XCAM-682	[User-Send tip] The 'Custom amount' should change once we select the radio buttons or hardcoded token values. 
XCAM-674	[User- Profile- Account setting- Change Password] Should ask for the old password while password reset. 
XCAM-657	Auto orientation for uploaded image
XCAM-644	Move option select post for 18+ popup to general, below Slider button instead of Popup tab
XCAM-620	Support mkv format
XCAM-522	[Technical] Add ref Id to avatar in file
XCAM-752	[Model-Earnings] Comma used in place of decimals 
XCAM-747	['Mobile view'-Model-Orders] Need to scroll[left/right] to see the orders.  The column is very wide to see.
XCAM-721	[Admin-Videos-Upload] Once ''is sale?'' option is switched off, the ''token'' option should fade away.
XCAM-718	[User-Purchased videos] The thumbnail is missing on the purchased videos, even after the model has uploaded it.  
XCAM-716	[Model-Signup page] The placeholder for 'username' is missing. 
XCAM-715	[User-Forgot password] Spelling mistake in the recovery email received. 
XCAM-664	[User- Forgot password] Recover password email received is empty. 
XCAM-663	[Verification email] The account verification email received is empty. 
XCAM-645	Update UI & UX
XCAM-455	Add free token to new signup user
XCAM-445	Add Min payment option to admin panel
XCAM-438	Mic on and off option for models during stream.
XCAM-759	[User-Control bar] Sound volume percentage is overlapping
XCAM-757	[User dashboard] Error message is received before initiating live streaming 
XCAM-753	[Admin] [Breadcrumbs] Home page option don't work
XCAM-751	[Admin-Model Earning] The conversion rate is changed to 0, but still showing '1'. 
XCAM-746	['Mobile view'-user/model-Profile] Clicking on an option should take to the corresponding result. 
XCAM-745	['Mobile view'-model-galleries] The texts are overlapped
XCAM-740	[Model dashboard-''Go live''-Start streaming] The user video is not visible even after joining the room. 
XCAM-739	[User/Model-Group chat] 'call time' and 'status' options are overlapped
XCAM-736	[Studio-Account settings] The upload doc. shows error while downloading
XCAM-735	[Admin-Studio-Update-Doc] The uploaded doc, shows error while clicking. 
XCAM-733	[User/Model-Private call request] The voices are not audible while conversation. 
XCAM-731	[User-Private chat] Once tip sent, the tip  shows different values.
XCAM-723	[User-Purchased videos] Clicking on video title creates 404 error. 
XCAM-722	[Admin-System settings] The ''Enable popup 18+'' option is added twice.  
XCAM-711	[User/Model-messages] Icon to shrink or expand text box, is not visible.   
XCAM-709	[Models-Earnings] Under earnings, the 'From' section and 'Tokens' are missing. 
XCAM-707	[User/model-Order details] The shipping code entered while ordering an item is missing under the order details. 
XCAM-706	[User dashboard-Send private call request-stop streaming] Error displayed, when a user stops streaming 
XCAM-705	[Model/User-group chat-live stream] Can't stream models/User videos/one cant view the video of other.
XCAM-703	[User/Model-Private chat-Call request] The user/model dashboard has texts overlapped. 
XCAM-696	[User-Account Settings]  The Avatar size is accepting more than 2MB. 
XCAM-689	[User/Messenger-Notification] The message notifications are not updating frequently while live chat. 
XCAM-686	[User/Model - Messenger] The last 'message sent' time is not updating on the user/model dashboard. 
XCAM-685	[User-Messenger] There are Incremental and Decremental counter visible in the text box.  Need to remove this option.  
XCAM-683	[User/Model - Messenger] The cursor/blinker is hiding in the text box. Not completely visible. 
XCAM-681	[Model-Galleries-Edit option] The photos/videos are not visible under the gallery section. 
XCAM-680	[User-Send tip]   The number of tokens received as a tip on the model's dashboard displays incorrect message. 
XCAM-679	[Model - Profile - Earnings] Total number of tokens are not updating on models dashboard.  
XCAM-678	[User-Profile-purchased galleries] The items under purchased gallery is not visible after click.
XCAM-677	[Model- Account settings-Documents] The uploaded documents are not visible/file corrupted. 
XCAM-676	[Model-Profile-Edit profile] The option 'Public hair' should be 'Pubic hair'. 
XCAM-675	[User-Funds/tokens] Multiple tabs are getting clicked by clicking on a single 'buy now' tab. 
XCAM-673	[Admin-Orders -Orders management] 'Action' keyword is missing.
XCAM-672	[Admin-Payout request-Performer request-Actions] Clicking on the actions icon creates an error.  
XCAM-669	[Admin-performers-actions-videos] Spelling mistake found for Actions.
XCAM-667	[Admin- Users - Actions] The Actions column is headless. It should include 'Actions' on top.  
XCAM-659	[xCams-homepage][Live demo] Once the home page is refreshed, the top left menu option is hiding due to a glitch. Need to hover the mouse to see options.
XCAM-656	Handle last message and notify recipient list for DM only
XCAM-655	Admin - Token manager - remove PI code column
XCAM-654	Full video screen resolution - fixed height
XCAM-653	Fix stream show black screen and incorrect poster
XCAM-652	Fix stream time and status
XCAM-650	Fix create admin product
XCAM-648	[Admin] Handle multi text editor input in same setting tab  
XCAM-647	[Admin] Validate account form - pending status 
XCAM-643	Fix responsive performer gird
XCAM-642	Add placeholder page register studio
XCAM-641	Studio login to 404 page
XCAM-637	Fix template send  verify mail
XCAM-636	Fix size all icon
XCAM-635	Cannot login after change username / email
XCAM-609	Send tip modal - Send button is disabled as default
XCAM-536	Fix view request call interval in model details page
