import { NavLink } from "react-router-dom";
import {
  MdMenu,
  MdClose,
  MdSupportAgent,
  MdKeyboardArrowDown,
  MdOutlineMarkEmailRead,
} from "react-icons/md";
import {
  MdOutlineSpeed,
  MdHeadphones,
  MdOutlinePeople,
  MdHomeWork,
  MdLeaderboard,
  MdLocalOffer,
  MdNewspaper,
  MdOutlinePayment,
  MdOutlineProductionQuantityLimits,
  MdOutlineCategory,
  MdAttachMoney,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { GrConfigure, GrDocumentPdf, GrDocumentStore } from "react-icons/gr";
import {
  FaFileInvoice,
  FaFileLines,
  FaPeopleGroup,
  FaMessage,
} from "react-icons/fa6";
import { useContext } from "react";
import { TbReport } from "react-icons/tb";
import { useSelector } from "react-redux";
import { IoSettingsSharp } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { checkAccess } from "../utils/checkAccess";
import { MdAutorenew } from "react-icons/md";
import { FaDatabase } from "react-icons/fa6";
import { useState } from "react";
import { SocketContext } from "../socket";

const SideNavigation = ({ isMenuOpen, setIsMenuOpen }) => {
  const socket = useContext(SocketContext);
  const { role, ...auth } = useSelector((state) => state.auth);
  const [showDMLeadsSubmenu, setShowDMLeadsSubmenu] = useState(false);
  const user = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const changeOnlineStatus = async (status) => {
    socket.emit("register", user.id);
    try {
      const response = await fetch(`${baseURL}chat/changestatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      const data = await response.json();
      console.log("Status updated successfully:", data);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="px-3 py-3 w-[100vw] h-[100vh] md:h-auto fixed top-0 left-0 overflow-y-auto overflow-x-hidden bg-[#f9fafc] xl:relative">
      {isMenuOpen && (
        <div
          className="flex justify-end mr-5 text-lg"
          onClick={() => setIsMenuOpen(false)}
        >
          <MdClose />
        </div>
      )}
      <ul className="text-sm font-bold overflow-x-hidden overflow-y-auto">
        <NavLink
          end={true}
          to=""
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdOutlineSpeed />
            </span>
            <span>Dashboard</span>
            {!checkAccess(auth, "dashboard")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="admins"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <FaPeopleGroup />
            </span>
            <span>Employees</span>
            {!checkAccess(auth, "admin")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="chats"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            if (isMenuOpen) {
              setIsMenuOpen(false);
            }
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(true)}
          >
            <span>
              <FaMessage />
            </span>
            <span>Chat</span>
            {!checkAccess(auth, "admin")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="individuals"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdOutlinePeople />
            </span>
            <span>Individuals</span>
            {!checkAccess(auth, "people")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="corporates"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdHomeWork />
            </span>
            <span>Corporates</span>
            {!checkAccess(auth, "company")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="leads"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdLeaderboard />
            </span>
            <span>Leads</span>
            {!checkAccess(auth, "lead")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="meetings"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdLeaderboard />
            </span>
            <span>Meetings</span>
            {!checkAccess(auth, "lead")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="assigned-leads"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdLeaderboard />
            </span>
            <span>Assigned Leads</span>
            {!checkAccess(auth, "lead")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <div
          onClick={() => setShowDMLeadsSubmenu((prev) => !prev)}
          className="cursor-pointer flex gap-x-12 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
        >
          <div className="flex gap-x-2">
            <span>
              <MdLeaderboard />
            </span>
            <span>DM Leads</span>
            {!checkAccess(auth, "lead")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </div>
          <MdKeyboardArrowDown />
        </div>
        {showDMLeadsSubmenu && (
          <div>
            <NavLink
              to="indiamart-leads"
              className={({ isActive }) =>
                isActive ? "text-[#1640d6]" : "text-black"
              }
              onClick={() => {
                isMenuOpen && setIsMenuOpen(false);
              }}
            >
              <li
                className="flex gap-x-2 pl-6 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
                onClick={() => changeOnlineStatus(false)}
              >
                <span>Indiamart Leads</span>
                {!checkAccess(auth, "lead")?.isAllowed && (
                  <span className="mt-1">
                    <FaLock size="12" color="#b1b1b1" />
                  </span>
                )}
              </li>
            </NavLink>
            <NavLink
              to="justdial-leads"
              className={({ isActive }) =>
                isActive ? "text-[#1640d6]" : "text-black"
              }
              onClick={() => {
                isMenuOpen && setIsMenuOpen(false);
              }}
            >
              <li
                className="flex gap-x-2 pl-6 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
                onClick={() => changeOnlineStatus(false)}
              >
                <span>JustDial Leads</span>
                {!checkAccess(auth, "lead")?.isAllowed && (
                  <span className="mt-1">
                    <FaLock size="12" color="#b1b1b1" />
                  </span>
                )}
              </li>
            </NavLink>
            <NavLink
              to="facebook-leads"
              className={({ isActive }) =>
                isActive ? "text-[#1640d6]" : "text-black"
              }
              onClick={() => {
                isMenuOpen && setIsMenuOpen(false);
              }}
            >
              <li
                className="flex gap-x-2 pl-6 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
                onClick={() => changeOnlineStatus(false)}
              >
                <span>Facebook Leads</span>
                {!checkAccess(auth, "lead")?.isAllowed && (
                  <span className="mt-1">
                    <FaLock size="12" color="#b1b1b1" />
                  </span>
                )}
              </li>
            </NavLink>
            <NavLink
              to="instagram-leads"
              className={({ isActive }) =>
                isActive ? "text-[#1640d6]" : "text-black"
              }
              onClick={() => {
                isMenuOpen && setIsMenuOpen(false);
              }}
            >
              <li
                className="flex gap-x-2 pl-6 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
                onClick={() => changeOnlineStatus(false)}
              >
                <span>Instagram Leads</span>
                {!checkAccess(auth, "lead")?.isAllowed && (
                  <span className="mt-1">
                    <FaLock size="12" color="#b1b1b1" />
                  </span>
                )}
              </li>
            </NavLink>
            <NavLink
              to="google-leads"
              className={({ isActive }) =>
                isActive ? "text-[#1640d6]" : "text-black"
              }
              onClick={() => {
                isMenuOpen && setIsMenuOpen(false);
              }}
            >
              <li
                className="flex gap-x-2 pl-6 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
                onClick={() => changeOnlineStatus(false)}
              >
                <span>Google Leads</span>
                {!checkAccess(auth, "lead")?.isAllowed && (
                  <span className="mt-1">
                    <FaLock size="12" color="#b1b1b1" />
                  </span>
                )}
              </li>
            </NavLink>
          </div>
        )}

        <NavLink
          to="customers"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdHeadphones />
            </span>
            <span>Customers</span>
            {!checkAccess(auth, "customer")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="offers"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdLocalOffer />
            </span>
            <span>Offers</span>
            {!checkAccess(auth, "offer")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="invoices"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <FaFileInvoice />
            </span>
            <span>Invoices</span>
            {!checkAccess(auth, "invoice")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="proforma-invoices"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <FaFileLines />
            </span>
            <span>Proforma Invoices</span>
            {!checkAccess(auth, "proforma-invoice")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="payments"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdOutlinePayment />
            </span>
            <span>Payments</span>
            {!checkAccess(auth, "payment")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="products"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdOutlineProductionQuantityLimits />
            </span>
            <span>Products</span>
            {!checkAccess(auth, "product")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="products-category"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdOutlineCategory />
            </span>
            <span>Products Category</span>
            {!checkAccess(auth, "category")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="expenses"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdAttachMoney />
            </span>
            <span>Expenses</span>
            {!checkAccess(auth, "expense")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="expenses-category"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdOutlineCategory />
            </span>
            <span>Expenses Category</span>
            {!checkAccess(auth, "expense-category")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="report"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <TbReport />
            </span>
            <span>Report</span>
            {!checkAccess(auth, "report")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        {/* <NavLink
            to="support"
            className={({ isActive }) =>
              isActive ? "text-[#1640d6]" : "text-black"
            }
            onClick={() => {
              isMenuOpen && setIsMenuOpen(false);
            }}
          >
            <li className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]">
              <span>
                <MdSupportAgent />
              </span>
              <span>Support</span>
              {!checkAccess(auth, 'support')?.isAllowed && <span className="mt-1"><FaLock size="12" color="#b1b1b1" /></span>}
            </li>
          </NavLink> */}

        {/* <NavLink
            to="assigned-support"
            className={({ isActive }) =>
              isActive ? "text-[#1640d6]" : "text-black"
            }
            onClick={() => {
              isMenuOpen && setIsMenuOpen(false);
            }}
          >
            <li className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]">
              <span>
                <MdSupportAgent />
              </span>
              <span>Assigned Support</span>
              {!checkAccess(auth, 'support')?.isAllowed && <span className="mt-1"><FaLock size="12" color="#b1b1b1" /></span>}
            </li>
          </NavLink> */}

        <NavLink
          to="emails"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdOutlineMarkEmailRead />
            </span>
            <span>Email Database</span>

            {!checkAccess(auth, "emails")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>
        <NavLink
          to="renewals"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <MdAutorenew />
            </span>
            <span>Renewals</span>

            {!checkAccess(auth, "renewals")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>
        <NavLink
          to="databank"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <FaDatabase />
            </span>
            <span>Archived</span>

            {!checkAccess(auth, "databank")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="media-center"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <GrDocumentStore />
            </span>
            <span>Media Center</span>

            {!checkAccess(auth, "databank")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        {/* <NavLink
          to="data-export"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <FaDatabase />
            </span>
            <span>Data Export</span>
            {!checkAccess(auth, "data-export")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink> */}

        <NavLink
          to="settings"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <IoSettingsSharp />
            </span>
            <span>Settings</span>
            {!checkAccess(auth, "website configuration")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>

        <NavLink
          to="website-configuration"
          className={({ isActive }) =>
            isActive ? "text-[#1640d6]" : "text-black"
          }
          onClick={() => {
            isMenuOpen && setIsMenuOpen(false);
          }}
        >
          <li
            className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"
            onClick={() => changeOnlineStatus(false)}
          >
            <span>
              <GrConfigure />
            </span>
            <span>CRM Configuration</span>
            {!checkAccess(auth, "website configuration")?.isAllowed && (
              <span className="mt-1">
                <FaLock size="12" color="#b1b1b1" />
              </span>
            )}
          </li>
        </NavLink>
      </ul>
    </div>
  );
};

export default SideNavigation;

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdLocalOffer />

//             </span>

//             <span>Offers</span>

//             {!checkAccess(auth, "offer")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="invoices"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <FaFileInvoice />

//             </span>

//             <span>Invoices</span>

//             {!checkAccess(auth, "invoice")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="proforma-invoices"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <FaFileLines />

//             </span>

//             <span>Proforma Invoices</span>

//             {!checkAccess(auth, "proforma-invoice")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="payments"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdOutlinePayment />

//             </span>

//             <span>Payments</span>

//             {!checkAccess(auth, "payment")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="products"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdOutlineProductionQuantityLimits />

//             </span>

//             <span>Products</span>

//             {!checkAccess(auth, "product")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="products-category"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdOutlineCategory />

//             </span>

//             <span>Products Category</span>

//             {!checkAccess(auth, "category")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="expenses"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdAttachMoney />

//             </span>

//             <span>Expenses</span>

//             {!checkAccess(auth, "expense")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="expenses-category"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdOutlineCategory />

//             </span>

//             <span>Expenses Category</span>

//             {!checkAccess(auth, "expense-category")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="report"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <TbReport />

//             </span>

//             <span>Report</span>

//             {!checkAccess(auth, "report")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         {/* <NavLink

//             to="support"

//             className={({ isActive }) =>

//               isActive ? "text-[#1640d6]" : "text-black"

//             }

//             onClick={() => {

//               isMenuOpen && setIsMenuOpen(false);

//             }}

//           >

//             <li className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]">

//               <span>

//                 <MdSupportAgent />

//               </span>

//               <span>Support</span>

//               {!checkAccess(auth, 'support')?.isAllowed && <span className="mt-1"><FaLock size="12" color="#b1b1b1" /></span>}

//             </li>

//           </NavLink> */}



//         {/* <NavLink

//             to="assigned-support"

//             className={({ isActive }) =>

//               isActive ? "text-[#1640d6]" : "text-black"

//             }

//             onClick={() => {

//               isMenuOpen && setIsMenuOpen(false);

//             }}

//           >

//             <li className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]">

//               <span>

//                 <MdSupportAgent />

//               </span>

//               <span>Assigned Support</span>

//               {!checkAccess(auth, 'support')?.isAllowed && <span className="mt-1"><FaLock size="12" color="#b1b1b1" /></span>}

//             </li>

//           </NavLink> */}



//         <NavLink

//           to="emails"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdOutlineMarkEmailRead />

//             </span>

//             <span>Email Database</span>



//             {!checkAccess(auth, "emails")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>

//         <NavLink

//           to="renewals"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <MdAutorenew />

//             </span>

//             <span>Renewals</span>



//             {!checkAccess(auth, "renewals")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>

//         <NavLink

//           to="databank"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <FaDatabase />

//             </span>

//             <span>Data Bank</span>



//             {!checkAccess(auth, "databank")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="document-center"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <GrDocumentStore />

//             </span>

//             <span>Document Center</span>



//             {!checkAccess(auth, "databank")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="data-export"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <FaDatabase />

//             </span>

//             <span>Data Export</span>

//             {!checkAccess(auth, "data-export")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="settings"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <IoSettingsSharp />

//             </span>

//             <span>Settings</span>

//             {!checkAccess(auth, "website configuration")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>



//         <NavLink

//           to="website-configuration"

//           className={({ isActive }) =>

//             isActive ? "text-[#1640d6]" : "text-black"

//           }

//           onClick={() => {

//             isMenuOpen && setIsMenuOpen(false);

//           }}

//         >

//           <li

//             className="flex gap-x-2 pl-3 pr-9 py-3 rounded-lg hover:bg-[#e6efff] hover:text-[#1640d6] text-[15px]"

//             onClick={() => changeOnlineStatus(false)}

//           >

//             <span>

//               <GrConfigure />

//             </span>

//             <span>CRM Configuration</span>

//             {!checkAccess(auth, "website configuration")?.isAllowed && (

//               <span className="mt-1">

//                 <FaLock size="12" color="#b1b1b1" />

//               </span>

//             )}

//           </li>

//         </NavLink>

//       </ul>

//     </div>

//   );

// };



// export default SideNavigation;


